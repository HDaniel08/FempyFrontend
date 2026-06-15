import * as SecureStore from "expo-secure-store";

/**
 * Itt állítod be a backend címet.
 * Lokális teszthez EXPO_PUBLIC_API_BASE_URL-lal felülírható.
 */
const DEFAULT_API_BASE_URL =
  "https://considerate-youthfulness-production-75bb.up.railway.app";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

const TOKEN_KEY = "auth_token";
const TENANT_KEY = "tenant_slug";

export async function setTenantSlug(slug) {
  if (!slug) throw new Error("Tenant slug hiányzik (setTenantSlug).");
  await SecureStore.setItemAsync(TENANT_KEY, String(slug));
}

export async function getTenantSlug() {
  return SecureStore.getItemAsync(TENANT_KEY);
}

export async function setAuthToken(token) {
  if (!token) throw new Error("Auth token hiányzik (setAuthToken).");
  await SecureStore.setItemAsync(TOKEN_KEY, String(token));
}

export async function getAuthToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  // tenant slugot megtarthatod, ha kényelmes
}

/**
 * Egységes fetch wrapper:
 * - hozzáadja a tenant headert és (ha van) a JWT-t
 * - JSON-t küld és JSON-t vár
 */
export async function apiFetch(
  path,
  {
    method = "GET",
    body,
    headers,
    skipTenant = false,
    networkRetries = 0,
    retryDelayMs = 700,
  } = {}
) {
  if (typeof path !== "string" || path.length === 0) {
    throw new Error(`apiFetch() hibás path: ${String(path)}`);
  }

  const tenantSlug = await getTenantSlug();
  const token = await getAuthToken();

  const url = `${API_BASE_URL}${path}`;
/*
  console.log("apiFetch URL:", url);
  console.log("apiFetch method:", method);
  console.log("apiFetch tenantSlug:", tenantSlug);
  console.log("apiFetch token exists:", !!token);
  console.log("1");
*/
  for (let attempt = 0; attempt <= networkRetries; attempt += 1) {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(!skipTenant && tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(headers || {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      //console.log("2");
      //console.log("status:", res.status);

      const rawText = await res.text();
      let data = null;

      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = rawText ? { raw: rawText } : null;
      }

      if (!res.ok) {
        const message =
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : null) ||
          `HTTP ${res.status}`;

        const error = new Error(
          Array.isArray(message) ? message.join("\n") : String(message)
        );
        error.status = res.status;
        error.data = data;

        if (res.status === 401) {
          await clearSession();
        }

        throw error;
      }

      return data;
    } catch (err) {
      const isNetworkError =
        err instanceof TypeError &&
        /network request failed|failed to fetch|load failed/i.test(
          String(err?.message),
        );

      if (!isNetworkError || attempt === networkRetries) {
        console.log("FETCH ERROR:", err);
        throw err;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, retryDelayMs * (attempt + 1)),
      );
    }
  }
}
