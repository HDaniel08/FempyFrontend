import { apiFetch, setAuthToken, setTenantSlug } from "../../../shared/api/http";

/**
 * Login:
 * - előbb elmentjük a tenant slugot (mert a header kell)
 * - aztán /auth/login
 * - token mentés
 */
export async function login({ email, password }) {
  

const res = await apiFetch("/auth/login-global", {
  method: "POST",
  body: { email, password },
  skipTenant: true,
});

  // backend: { accessToken: "..." }
  await setAuthToken(res.accessToken);
  await setTenantSlug(res.tenant?.slug);
  return res;
}

export async function me() {
  return apiFetch("/auth/me");
}
