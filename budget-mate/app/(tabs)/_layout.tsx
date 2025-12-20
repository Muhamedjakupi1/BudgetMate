import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";


export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    })();
  }, []);

  return (
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopWidth: 0,
            height: 75,
            elevation: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 5,
            fontWeight: '500',
          },
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: '#999',
          tabBarIcon: ({ focused, color}) => {
            let iconName: any;
            if (route.name === 'index') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'transaction') iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
            else if (route.name === 'expensesHistory') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
            else if (route.name === 'profile') iconName = focused ? 'person' : 'person-outline';
            else if (route.name === 'notifications')iconName = focused ? 'notifications': 'notifications-outline';

            return <Ionicons name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="transaction" options={{ title: 'Transaction' }} />
        <Tabs.Screen name="expensesHistory" options={{ title: 'Expenses' }} />
        <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        
      </Tabs>
  );
}
