import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#888',
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'HomePage',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />

      {/* Transactions */}
      <Tabs.Screen
        name="transaction" 
        options={{
          title: 'Transaction',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>➕</Text>,
        }}
      />

      {/* Expenses History */}
      <Tabs.Screen
        name="expensesHistory" 
        options={{
          title: 'Expenses',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📄</Text>,
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
