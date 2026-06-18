import { Platform } from "react-native";
import appConfig from "../../../../app.json";
import { apiFetch } from "../api/http";

const expoConfig = appConfig.expo ?? {};

export function getCurrentAppVersion() {
  const platform = Platform.OS;
  return {
    platform,
    version: expoConfig.version ?? "0.0.0",
    buildNumber:
      platform === "ios"
        ? expoConfig.ios?.buildNumber
        : expoConfig.android?.versionCode,
  };
}

export async function checkAppVersion() {
  const current = getCurrentAppVersion();
  const params = new URLSearchParams({
    platform: current.platform,
    version: String(current.version),
    buildNumber: String(current.buildNumber ?? ""),
  });

  try {
    const result = await apiFetch(`/app-version?${params.toString()}`, {
      skipTenant: true,
      networkRetries: 1,
    });
    return { ...result, current: result?.current ?? current };
  } catch (error) {
    console.log("App verzio ellenorzes hiba:", error?.message);
    return {
      supported: true,
      requiresUpdate: false,
      reason: "version_check_unavailable",
      current,
      errorMessage: error?.message,
    };
  }
}
