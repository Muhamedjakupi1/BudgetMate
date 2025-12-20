import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from '../context/AuthContext'; 

export const unstable_settings = {
  initialRouteName: "(auth)", 
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Auth screens (outside tabs) */}
          <Stack.Screen name="(auth)" />

          {/* Main app with tabs */}
          <Stack.Screen name="(tabs)" />

          <Stack.Screen name="expense/[id]" options={{ animation: "slide_from_right",}}/>

          {/* Optional: modal or other top-level pages */}
          <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

