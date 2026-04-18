import { apiFetch } from "../../../shared/api/http";

export async function registerDevice({ expoToken, deviceInfo }) {
 
  return apiFetch("/devices/register", {
    method: "POST",
    body: { expoToken, deviceInfo },
  });
}
