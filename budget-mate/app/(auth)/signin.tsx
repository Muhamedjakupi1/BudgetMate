import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useRouter } from "expo-router";
import * as Font from 'expo-font';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    Font.loadAsync(Ionicons.font).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      setError("Email is not valid! Please check again.");
      return false;
    }

    setError("");

    Alert.alert('Welcome back!', `Logged in as ${email}`);
    router.push('/(tabs)');

    setEmail('');
    setPassword('');

    return true;
  };

   const handleLogin = async () => {
    if (!validateInputs()) return;
    setFontsLoaded(true); // start loading

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error:any) {
      if (error.code === "auth/invalid-credential") {
        setError("Incorrect email or password");
      } else {
        setError(error.message);
      }
      
    } finally {
      setFontsLoaded(false);
    }

  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.card}>
        <Text style={styles.title}>Log In</Text>

        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={styles.inputFlex}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={styles.inputFlex}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.small}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.link}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 8,
  },
  inputFlex: {
    flex: 1,
    height: 45,
    color: '#333',
  },
  button: {
    backgroundColor: '#22ab54',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  small: {
    color: '#555',
  },
  link: {
    color: '#22ab54',
    fontWeight: '600',
    marginLeft: 4,
  },
});
