import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState } from "react-native";
import {
  clearSession,
  getAuthToken,
  getTenantSlug,
  setAuthToken,
  setTenantSlug,
  apiFetch,
} from "../shared/api/http";
import { setupAndRegisterPushToken } from "../shared/push/pushClient";
import {
  startUsageTracking,
  stopUsageTracking,
} from "../shared/usage/usageClient";
/**
 * AuthContext célja:
 * - tudd, be van-e jelentkezve a user
 * - tudd, épp tölt-e (app induláskor token ellenőrzés)
 * - tudd a user profilját (/auth/me)
 * - legyen login/logout metódus
 */

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
 
  if (!ctx) throw new Error("useAuth() csak AuthProvider alatt használható.");
  return ctx;
}

export function AuthProvider({ children }) {
  const [isBooting, setIsBooting] = useState(true); // app induláskor inicializálunk
  const [user, setUser] = useState(null); // /auth/me válasz
  const [token, setToken] = useState(null);
  const [tenantSlug, setTenant] = useState(null);
  const [tenantAppAccessEnabled, setTenantAppAccessEnabled] = useState(true);

  async function refreshMe() {
    const me = await apiFetch("/auth/me");
    setUser(me);
    if (typeof me?.tenant?.appAccessEnabled === "boolean") {
      setTenantAppAccessEnabled(me.tenant.appAccessEnabled);
    }
    return me;
  }

  // App induláskor: megnézzük van-e mentett session
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await getAuthToken();
        const savedTenant = await getTenantSlug();

        // ha bármelyik hiányzik, nincs session
        if (!savedToken || !savedTenant) {
          setIsBooting(false);
          return;
        }

        setToken(savedToken);
        setTenant(savedTenant);

        // Session validálás: /auth/me
        // (Ha 401, az apiFetch clearSession-t csinál, és mi is resetelünk)
        await refreshMe();
        // 🔔 PUSH REGISZTRÁCIÓ
        setupAndRegisterPushToken().catch((e) =>
          console.log("Push setup hiba (boot):", e?.message),
        );
        startUsageTracking();
      } catch (e) {
        // bármi hiba → session reset
        await clearSession();
        setUser(null);
        setToken(null);
        setTenant(null);
        setTenantAppAccessEnabled(true);
      } finally {
        setIsBooting(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!token || !tenantSlug) return undefined;

    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;

      refreshMe().catch((e) => {
        console.log("Session frissítés hiba:", e?.message);
      });
    });

    return () => subscription.remove();
  }, [token, tenantSlug]);

  /**
   * Global login:
   * - tenantSlug nincs előre
   * - backend visszaad: accessToken + tenant.slug
   */
  async function loginGlobal({ email, password }) {
    // Tenant header nélkül hívjuk
    const res = await apiFetch("/auth/login-global", {
      method: "POST",
      body: { email, password },
      skipTenant: true,
    });

    if (typeof res?.tenant?.appAccessEnabled === "boolean") {
      setTenantAppAccessEnabled(res.tenant.appAccessEnabled);
    }
   
    // Mentés SecureStore-ba (string)
    await setAuthToken(res.accessToken);
    await setTenantSlug(res.tenant.slug);

    // State frissítés
    setToken(res.accessToken);
    setTenant(res.tenant.slug);

    // Me lekérés (innentől már mehet a tenant header + token)
    const me = await refreshMe();
    // 🔔 PUSH REGISZTRÁCIÓ
    setupAndRegisterPushToken().catch((e) =>
      console.log("Push setup hiba (boot):", e?.message),
    );
    startUsageTracking();
    return me;
  }

  async function logout() {
    stopUsageTracking();
    await clearSession();
    setUser(null);
    setToken(null);
    setTenant(null);
    setTenantAppAccessEnabled(true);
  }

  const value = useMemo(() => {
    return {
      isBooting,
      isAuthenticated: !!user,
      user,
      token,
      tenantSlug,
      tenantAppAccessEnabled,
      loginGlobal,
      logout,
      refreshMe,
    };
  }, [isBooting, user, token, tenantSlug, tenantAppAccessEnabled]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
