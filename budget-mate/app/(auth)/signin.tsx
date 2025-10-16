import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Temporary success message
    Alert.alert('Welcome back!', `Logged in as ${email}`);
    setEmail('');
    setPassword('');

  };

  return (
    <SafeAreaView>
      <View>
         <Text>Log In</Text>
      </View>
    </SafeAreaView>
  );
}

