import { AppState, Platform } from "react-native";
import { apiFetch } from "../api/http";
import { getCurrentAppVersion } from "../version/versionClient";

const HEARTBEAT_MS = 60000;

let sessionId = null;
let intervalId = null;
let subscription = null;
let isTracking = false;

async function sendHeartbeat() {
  const res = await apiFetch("/usage/heartbeat", {
    method: "POST",
    body: {
      sessionId,
      platform: Platform.OS,
      appVersion: getCurrentAppVersion().version,
    },
  });
  if (res?.id) sessionId = res.id;
  return res;
}

async function sendEnd() {
  const id = sessionId;
  sessionId = null;
  if (!id) return;
  await apiFetch("/usage/end", {
    method: "POST",
    body: { sessionId: id },
  });
}

function startInterval() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    sendHeartbeat().catch((e) =>
      console.log("Usage heartbeat hiba:", e?.message),
    );
  }, HEARTBEAT_MS);
}

function stopInterval() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
}

export function startUsageTracking() {
  if (isTracking) return;
  isTracking = true;

  if (AppState.currentState === "active") {
    sendHeartbeat().catch((e) =>
      console.log("Usage start hiba:", e?.message),
    );
    startInterval();
  }

  subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      sendHeartbeat().catch((e) =>
        console.log("Usage resume hiba:", e?.message),
      );
      startInterval();
      return;
    }

    stopInterval();
    sendEnd().catch((e) => console.log("Usage end hiba:", e?.message));
  });
}

export function stopUsageTracking() {
  if (!isTracking) return;
  isTracking = false;
  stopInterval();
  subscription?.remove?.();
  subscription = null;
  sendEnd().catch((e) => console.log("Usage stop hiba:", e?.message));
}
