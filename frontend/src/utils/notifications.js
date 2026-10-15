import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let handlerSet = false;

export async function registerForPush(apiUrl, authToken) {
  // الإشعارات البعيدة ما بتشتغل على Expo Go ولا على الويب
  if (Platform.OS === "web" || isExpoGo) return;

  try {
    const Notifications = require("expo-notifications");
    const Device = require("expo-device");

    if (!handlerSet) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerSet = true;
    }

    if (!Device.isDevice) return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== "granted") return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    await fetch(`${apiUrl}/push/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch (e) {
    console.log("push registration failed:", e?.message);
  }
}