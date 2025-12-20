import  { useCallback, useEffect, useState, useRef, memo } from "react";
import { View, Text, FlatList, StyleSheet, Alert, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
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

type FirestoreNotif = {
  id: string; 
  type: NotifType;
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

const NotifRow = memo(function NotifRow({
  item,
  cancelNotif,
  registerOut,
}: {
  item: FirestoreNotif;
  cancelNotif: (notificationId: string, itemId: string) => Promise<void>;
  registerOut: (id: string, fn: () => Promise<void>) => void;
}) {

  const anim = useRef(new Animated.Value(1)).current; 

  useEffect(() => {
    registerOut(item.id, () => {
      return new Promise<void>((resolve) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => resolve());
      });
    });
  }, [item.id, registerOut]);

  const shownDate = item.scheduledAt ?? item.createdAt;
  const cancelId =  item.id;

  return (
    <Animated.View
      style={{
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, item.read ? 0.7 : 1] }),
        transform: [
          {
            translateX: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [-16, 0],
            }),
          },
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.98, 1],
            }),
          },
        ],
      }}
    >
      <View style={styles.typeRow}>
        <Ionicons name={iconForType(item.type)} size={16} color="#555" />
        <Text style={styles.typeText}>{labelForType(item.type)}</Text>
        <View style={styles.dot} />
      </View>

      <NotifCard
        item={{
          taskTitle: item.title,
          body: item.body,
          scheduledAt: shownDate,
          notificationId: cancelId,
        }}
        cancel={(id: string) => cancelNotif(id, item.id)}
      />
    </Animated.View>
  );
});

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifList, setNotifList] = useState<FirestoreNotif[]>([]);

  const listOpacity = useRef(new Animated.Value(0)).current;
  const listScale = useRef(new Animated.Value(0.96)).current;

  const outAnimMap = useRef(new Map<string, () => Promise<void>>()).current;

  const registerOut = useCallback((id: string, fn: () => Promise<void>) => {
    outAnimMap.set(id, fn);
  }, []);

  useFocusEffect(
    useCallback(() => {
      listOpacity.stopAnimation();
      listScale.stopAnimation();

      listOpacity.setValue(0);
      listScale.setValue(0.96);

      Animated.parallel([
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(listScale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, [listOpacity, listScale])
  );

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
    async ( itemId: string) => {
      if (!user?.uid) return;

      const item = notifList.find((n) => n.id === itemId);


      if (!item) {
        Alert.alert("Error", "Notification not found.");
        return;
      }

      try {

        const animateOut = outAnimMap.get(itemId);
        if (animateOut) await animateOut();

        if (item.expoNotificationId) {
          await Notifications.cancelScheduledNotificationAsync(
            item.expoNotificationId
          );
        }

        await deleteDoc(doc(db, "users", user.uid, "notifications", item.id));
      } catch (e) {
        Alert.alert("Error", "Failed to remove notification.");
      }
    },
    [user?.id, notifList]
  );

  const renderItem = useCallback(
    ({ item }: { item: FirestoreNotif }) => (
       <NotifRow item={item} cancelNotif={cancelNotif} registerOut={registerOut} />
    ),
    [cancelNotif, registerOut]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="notifications-outline" size={22} color="#111" />
          <Text style={styles.title}>Notifications</Text>
        </View>

        <Animated.View
          style={{
            flex: 1,
            opacity: listOpacity,
            transform: [{ scale: listScale }],
          }}
        >
          <FlatList
            data={notifList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            contentContainerStyle={notifList.length === 0 ? styles.emptyWrap : undefined}
            ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff"
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#333"
  },
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
    color: "#555"
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#aaa",
    marginHorizontal: 4
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: "center"
  },
  empty: {
    color: "#777",
    textAlign: "center"
  },
});
