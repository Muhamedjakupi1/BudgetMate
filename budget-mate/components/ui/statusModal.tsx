import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  message: string;
  type?: "success" | "error";
};

export default function StatusModal({ visible, message, type = "success" }: Props) {
  const isSuccess = type === "success";
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Ionicons
            name={isSuccess ? "checkmark-circle-outline" : "close-circle-outline"}
            size={50}
            color={isSuccess ? "#22ab54" : "#dc3545"}
          />
          <Text style={[styles.text, { color: isSuccess ? "#22ab54" : "#dc3545" }]}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  content: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
    maxWidth: "70%",
  },
  text: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
