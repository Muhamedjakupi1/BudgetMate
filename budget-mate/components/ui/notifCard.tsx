import React, { memo } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type NotificationItem = {
  taskTitle: string;
  body: string;
  scheduledAt?: Date;
  notificationId: string;
};

type NotifCardProps = {
  item: NotificationItem;
  cancel: (id: string) => void;
};

const NotifCard = memo(({ item, cancel }: NotifCardProps) => {
  return (
    <View style={styles.card}>

      <View style={styles.header}>
        <Text style={styles.taskTitle}>{item.taskTitle}</Text>

        <View style={styles.tag}>
          <Text style={styles.tagText}>Reminder</Text>
        </View>
      </View>

      <Text style={styles.bodyText}>{item.body}</Text>

      <View style={styles.footer}>
              <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={14} />
                  <Text style={styles.time}>
                      {item.scheduledAt ? item.scheduledAt.toLocaleString() : ""}
                  </Text>
              </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.cancelBtn}
          onPress={() => cancel(item.notificationId)}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 10,
  },
  tag: {
    backgroundColor: "#e8f2ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34aac7",
  },
  bodyText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#4a4a4a",
  },
  footer: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6 },
  time: {
    fontSize: 12,
    color: "#7a7a7a",
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#d41309ff",
  },
});

export default NotifCard;
