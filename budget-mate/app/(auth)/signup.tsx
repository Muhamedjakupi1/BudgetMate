import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Switch, 
  StatusBar, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Font from 'expo-font';

export default function SignUpScreen() {
  const router = useRouter();

  // 🔹 All hooks must be defined unconditionally at the top
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync(Ionicons.font);
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  const handleSignUp = () => {
    if (!acceptedTerms) {
      alert('Please accept the Terms & Conditions.');
      return;
    }

    if (password !== confirm) {
      alert('Passwords do not match.');
      return;
    }

    alert(`Account created for ${name}`);
    router.push('/(tabs)');

    // Reset form
    setName('');
    setEmail('');
    setPassword('');
    setConfirm('');
    setAcceptedTerms(false);
  };

  // 🔹 Safe to conditionally render *after* all hooks are defined
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22ab54" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        {/* Full Name */}
        <View style={styles.iconInputContainer}>
          <Ionicons name="person-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Email */}
        <View style={styles.iconInputContainer}>
          <Ionicons name="mail-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Password */}
        <View style={styles.iconInputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Confirm Password */}
        <View style={styles.iconInputContainer}>
          <Ionicons name="lock-open-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholderTextColor="#aaa"
          />
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Switch
            value={acceptedTerms}
            onValueChange={setAcceptedTerms}
            thumbColor={acceptedTerms ? '#22ab54' : '#ccc'}
          />
          <Text style={styles.termsText}>
            I accept the <Text style={styles.link}>Terms & Conditions</Text>
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Footer */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  inputWithIcon: {
    paddingLeft: 38,
  },
  iconInputContainer: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    top: 14,
    left: 12,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsText: {
    marginLeft: 10,
    color: '#444',
    flexShrink: 1,
  },
});
