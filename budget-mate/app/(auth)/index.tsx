import { useEffect, useRef } from "react";
import { Text, TouchableOpacity, StyleSheet, StatusBar, Animated, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import AnimatedPressButton from "../../components/ui/animatedButton";

export default function WelcomeScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white"></StatusBar>
      <Text style={styles.title}>
        <Text style={styles.titleBlue}>Budget</Text>
        <Text style={styles.titleGreen}>Mate</Text>
      </Text>

      <Text style={styles.subtitle}>Smart savings, made simple.</Text>

      <Animated.View
        style={{
          marginBottom: 30,
          opacity,
          transform: [{ scale }],
        }}
      >
        <Image
          source={require("../../assets/images/budgetmate-logo.png")}
          style={{ width: 120, height: 120 }}
          contentFit="contain"
          transition={150}
        />
      </Animated.View>

      <AnimatedPressButton
        style={styles.signupButton}
        onPress={() => router.push("/(auth)/signup")}
      >
        <Text style={styles.signupText}>Sign Up</Text>
      </AnimatedPressButton>

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
