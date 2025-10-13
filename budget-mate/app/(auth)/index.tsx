import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>
        <Text style={styles.titleBlue}>Budget</Text>
        <Text style={styles.titleGreen}>Mate</Text>
      </Text>

      <Text style={styles.subtitle}>Smart savings, made simple.</Text>

      {/* Logo */}
      <Image
        source={require("../../assets/images/budgetmate-logo.png")} // ✅ correct path
        style={{ width: 120, height: 120, marginBottom: 30 }}
      />

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => router.replace("/(auth)/signup")}
      >
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Sign In Link */}
      <Text style={styles.signinText}>
        Already have an account?{" "}
        <Text
          style={styles.signinLink}
          onPress={() => router.push("/(auth)/signin")}
        >
          Sign in.
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  titleBlue: {
    color: "#0d1b2a",
  },
  titleGreen: {
    color: "#3DBA6F",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 40,
  },
  signupButton: {
    backgroundColor: "#3DBA6F",
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  signupText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  signinText: {
    fontSize: 15,
    color: "#222",
  },
  signinLink: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
