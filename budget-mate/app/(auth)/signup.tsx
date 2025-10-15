import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router"; 

export default function SignUpScreen() {
  const router = useRouter(); 

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSignUp = () => {
  if (!name.trim() || !email.trim() || !password || !confirm) {
    alert('Please fill in all fields');
    return;
  }

  if (password !== confirm) {
    alert('Passwords do not match');
    return;
  }

  alert(`Account created for ${name}`);
  router.push('/signin'); 

  setName('');
  setEmail('');
  setPassword('');
  setConfirm('');
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        <View style={{ position: 'relative' }}>
          <Ionicons
            name="person-outline"
            size={20}
            color="#444"
            style={{ position: 'absolute', top: 14, left: 12 }}
          />
          <TextInput
            style={[styles.input, { paddingLeft: 38 }]}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={{ position: 'relative' }}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#444"
            style={{ position: 'absolute', top: 14, left: 12 }}
          />
          <TextInput
            style={[styles.input, { paddingLeft: 38 }]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={{ position: 'relative' }}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#444"
            style={{ position: 'absolute', top: 14, left: 12 }}
          />
          <TextInput
            style={[styles.input, { paddingLeft: 38 }]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={{ position: 'relative' }}>
          <Ionicons
            name="lock-open-outline"
            size={20}
            color="#444"
            style={{ position: 'absolute', top: 14, left: 12 }}
          />
          <TextInput
            style={[styles.input, { paddingLeft: 38 }]}
            placeholder="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text> 
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.small}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signin')}> 
            <Text style={styles.link}> Sign in</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444',
    color: '#000',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#22ab54',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  small: {
    color: '#444',
  },
  link: {
    color: '#22c55e',
    fontWeight: '600',
    marginLeft: 6,
  },
});
