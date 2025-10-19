import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { BudgetProvider } from '@/constants/budgetContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <BudgetProvider>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderTopWidth: 0,
            height: 65,
            elevation: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 5,
            fontWeight: '500',
          },
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: '#999',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;
            if (route.name === 'index') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'transaction') iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
            else if (route.name === 'expensesHistory') iconName = focused ? 'pie-chart' : 'pie-chart-outline';
            else if (route.name === 'profile') iconName = focused ? 'person' : 'person-outline';

            return <Ionicons name={iconName} size={24} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="transaction" options={{ title: 'Transaction' }} />
        <Tabs.Screen name="expensesHistory" options={{ title: 'Expenses' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </BudgetProvider>
  );
}
