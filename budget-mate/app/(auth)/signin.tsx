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
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { useRouter } from "expo-router";
import * as Font from 'expo-font';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import StatusModal from '../../components/ui/statusModal';
import { setDoc } from "firebase/firestore";

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");


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
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      console.log('Logged in user:', user.uid, user.email, userSnap.data());
      setStatusType("success");
      setSuccessModalVisible(true);
      setSuccessMessage("Successfully Signed In!");

      setTimeout(() => {
        setSuccessModalVisible(false);
        router.push('../(tabs)');
      }, 1500);
    } catch (err: any) {
      console.error('Login error', err);

      let message = err.message || "Login failed";
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        message = "Wrong password or username";
      }

      setStatusType("error");
      setSuccessMessage(message);
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          overallBudget: 0
        });
      }
      setStatusType("success");
      setSuccessModalVisible(true);
      setSuccessMessage("Successfully Signed In!");
      setTimeout(() => {
        setSuccessModalVisible(false);
        router.push('../(tabs)');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setStatusType("error");
      setSuccessMessage(err.message || "Login failed");
      setSuccessModalVisible(true);
    }
  };

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
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign in"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <View style={styles.googleContent}>
            <Ionicons name="logo-google" size={20} color="#4285F4" style={styles.googleIcon} />
            <Text style={styles.googleText}>Sign in with Google</Text>
          </View>
        </TouchableOpacity>


        <View style={styles.footerRow}>
          <Text style={styles.small}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.link}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusModal
        visible={successModalVisible}
        message={successMessage}
        type={statusType}
      />

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
  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center"
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleIcon: {
    marginRight: 10,
  },

  googleText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  },

});
