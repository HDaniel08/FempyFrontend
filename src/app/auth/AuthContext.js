import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearSession,
  getAuthToken,
  getTenantSlug,
  setAuthToken,
  setTenantSlug,
  apiFetch,
} from "../shared/api/http";
import { setupAndRegisterPushToken } from "../shared/push/pushClient";
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
        const me = await apiFetch("/auth/me");
        setUser(me);
        // 🔔 PUSH REGISZTRÁCIÓ
        setupAndRegisterPushToken().catch((e) =>
          console.log("Push setup hiba (boot):", e?.message),
        );
      } catch (e) {
        // bármi hiba → session reset
        await clearSession();
        setUser(null);
        setToken(null);
        setTenant(null);
      } finally {
        setIsBooting(false);
      }
    })();
  }, []);

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
   
    // Mentés SecureStore-ba (string)
    await setAuthToken(res.accessToken);
    await setTenantSlug(res.tenant.slug);

    // State frissítés
    setToken(res.accessToken);
    setTenant(res.tenant.slug);

    // Me lekérés (innentől már mehet a tenant header + token)
    const me = await apiFetch("/auth/me");
    setUser(me);
    // 🔔 PUSH REGISZTRÁCIÓ
    setupAndRegisterPushToken().catch((e) =>
      console.log("Push setup hiba (boot):", e?.message),
    );
    return me;
  }

  async function logout() {
    await clearSession();
    setUser(null);
    setToken(null);
    setTenant(null);
  }

  const value = useMemo(() => {
    return {
      isBooting,
      isAuthenticated: !!user,
      user,
      token,
      tenantSlug,
      loginGlobal,
      logout,
    };
  }, [isBooting, user, token, tenantSlug]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
