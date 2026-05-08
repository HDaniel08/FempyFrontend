import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { registerDevice } from "../../features/notifications/api/deviceApi";
import Constants from "expo-constants";
/**
 * iOS/Android: alap notification handler (ha app nyitva van)
 * - Most csak engedjük a megjelenítést
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Push token regisztráció:
 * - permission kérés
 * - Expo push token lekérés
 * - backend /devices/register meghívása
 */
export async function setupAndRegisterPushToken() {
  // Expo Go-ban csak fizikai eszközön működik rendesen a push token flow
  if (!Device.isDevice) {
    console.log("Push: emulátoron/desktopon nem regisztrálunk Expo tokent.");
    return null;
  }

  // 1) permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push permission nincs megadva.");
    return null;
  }

  // 2) expo token
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;

  const tokenRes = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  const expoToken = tokenRes.data;

  // 3) backend regisztráció
  // deviceInfo: később hasznos lehet debughoz
  const deviceInfo = {
    platform: Device.osName,
    osVersion: Device.osVersion,
    modelName: Device.modelName,
  };

  const saved = await registerDevice({ expoToken, deviceInfo });


  return { expoToken, saved };
}
