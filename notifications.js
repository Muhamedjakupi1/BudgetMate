import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Alert } from "react-native";

export async function registerForPushNotifications() {
    const {status} = await Notifications.getPermissionsAsync();

    if (status !== "granted") {
        Alert.alert("Permission required", "Permission is required to get updates");

        return;
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX
        })
    }

    return true
}