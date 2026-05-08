import { apiFetch } from "../../../shared/api/http";

export async function listLeadershipSelfContent() {
  return apiFetch("/content/surfaces/leadership_self/items");
}
