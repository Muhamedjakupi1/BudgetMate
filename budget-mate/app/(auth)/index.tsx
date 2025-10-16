import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white"></StatusBar>
      <Text style={styles.title}>
        <Text style={styles.titleBlue}>Budget</Text>
        <Text style={styles.titleGreen}>Mate</Text>
      </Text>

      <Text style={styles.subtitle}>Smart savings, made simple.</Text>

      <Image
        source={require("../../assets/images/budgetmate-logo.png")} 
        style={{ width: 120, height: 120, marginBottom: 30 }}
      />

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => router.replace("/(auth)/signup")}
      >
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.signinText}>
        Already have an account?{" "}
        <Text
          style={styles.signinLink}
          onPress={() => router.push("/(auth)/signin")}
        >
          Sign in.
        </Text>
      </Text>
    </SafeAreaView>
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
