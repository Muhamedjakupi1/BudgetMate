import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import NotifCard from "../../components/ui/notifCard";

type NotifType =
  | "bill_reminder"
  | "summary"
  | "low_budget"
  | "unusual_spending"
  | "follow_up"
  | "profile_setup";

type NotifChannel = "push" | "in_app";

type FirestoreNotif = {
  id: string; 
  type: NotifType;
  channel: NotifChannel;

  title: string;
  body: string;

  scheduledAt?: Date;         
  createdAt?: Date;           
  expoNotificationId?: string; 
  read?: boolean;
};

function iconForType(type: NotifType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "bill_reminder":
      return "receipt-outline";
    case "summary":
      return "stats-chart-outline";
    case "low_budget":
      return "alert-circle-outline";
    case "unusual_spending":
      return "trending-up-outline";
    case "follow_up":
      return "checkmark-done-outline";
    case "profile_setup":
      return "person-circle-outline";
    default:
      return "notifications-outline";
  }
}

function labelForType(type: NotifType) {
  switch (type) {
    case "bill_reminder":
      return "Bill reminder";
    case "summary":
      return "Daily/Weekly summary";
    case "low_budget":
      return "Low budget warning";
    case "unusual_spending":
      return "Unusual spending";
    case "follow_up":
      return "Follow-up";
    case "profile_setup":
      return "Profile setup";
    default:
      return "Notification";
  }
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifList, setNotifList] = useState<FirestoreNotif[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const ref = collection(db, "users", user.uid, "notifications");

    const notifsQuery = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      notifsQuery,
      (snapshot) => {
        const list: FirestoreNotif[] = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() as any;

            const type = data.type as NotifType | undefined;
            const channel = (data.channel as NotifChannel | undefined) ?? "in_app";
            if (!type) return null;

            const allowed: NotifType[] = [
              "bill_reminder",
              "summary",
              "low_budget",
              "unusual_spending",
              "follow_up",
              "profile_setup",
            ];
            if (!allowed.includes(type)) return null;

            return {
              id: docSnap.id,
              type,
              channel,
              title: data.title ?? data.taskTitle ?? "Notification",
              body: data.body ?? "",
              scheduledAt: data.scheduledAt?.toDate?.() ?? undefined,
              createdAt: data.createdAt?.toDate?.() ?? undefined,
              expoNotificationId: data.expoNotificationId ?? undefined,
              read: data.read ?? false,
            } as FirestoreNotif;
          })
          .filter(Boolean) as FirestoreNotif[];

        setNotifList(list);
      },
      () => Alert.alert("Error", "Failed to load notifications.")
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const cancelNotif = useCallback(
    async (notificationId: string) => {
      if (!user?.uid) return;

      const item = notifList.find(
        (n) => n.expoNotificationId === notificationId || n.id === notificationId
      );

      if (!item) {
        Alert.alert("Error", "Notification not found.");
        return;
      }

      try {
        if (item.channel === "push") {
          if (item.expoNotificationId) {
            await Notifications.cancelScheduledNotificationAsync(item.expoNotificationId);
          } else {
              console.warn(
                  "Push notification has no expoNotificationId. Cannot cancel scheduled notification."
              );
          }
        }
        await deleteDoc(doc(db, "users", user.uid, "notifications", item.id));
      } catch (e) {
        Alert.alert("Error", "Failed to remove notification.");
      }
    },
    [user?.id, notifList]
  );

  const renderItem = useCallback(
    ({ item }: { item: FirestoreNotif }) => {
      const shownDate = item.scheduledAt ?? item.createdAt;

      const cancelId = item.channel === "push" ? item.expoNotificationId ?? item.id : item.id;

      return (
        <View style={{ opacity: item.read ? 0.7 : 1 }}>
          <View style={styles.typeRow}>
            <Ionicons name={iconForType(item.type)} size={16} color="#555" />
            <Text style={styles.typeText}>{labelForType(item.type)}</Text>
            <View style={styles.dot} />
            <Text style={styles.typeText}>
              {item.channel === "push" ? "Outside app" : "In app"}
            </Text>
          </View>

          <NotifCard
            item={{
              taskTitle: item.title,
              body: item.body,
              scheduledAt: shownDate,
              notificationId: cancelId,
            }}
            cancel={cancelNotif}
          />
        </View>
      );
    },
    [cancelNotif]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="notifications-outline" size={22} color="#111" />
          <Text style={styles.title}>Notifications</Text>
        </View>

        <FlatList
          data={notifList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          contentContainerStyle={notifList.length === 0 ? styles.emptyWrap : undefined}
          ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#f7f7f7" },
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: "#111" },

  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    marginLeft: 4,
  },
  typeText: { 
    fontSize: 12, 
    fontWeight: "700", 
    color: "#555" },
  dot: { 
    width: 4, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: "#aaa", 
    marginHorizontal: 4 },

  emptyWrap: { 
    flexGrow: 1, 
    justifyContent: "center" },
  empty: { 
    color: "#777", 
    textAlign: "center" },
});
