import { useState, useEffect } from 'react';
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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import StatusModal from '../../components/ui/statusModal'

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
};

export default function SignUpScreen() {
  const router = useRouter();

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync(Ionicons.font);
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  const validateInputs = () => {
    setErrors({} as Errors);
    let isValid = true;
    const newErrors: Errors = {};
    if (name.trim() === "" || email.trim() === "" || password.trim() === "" || confirm.trim() === "") {
      newErrors.name = "All fields are required";
      isValid = false;
    }

    if (name.length < 5) {
      newErrors.name = "Name must be at least 5 characters";
      isValid = false;
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";
      isValid = false;
    }
    
    if (password !== confirm) {
      newErrors.confirm = "Passwords do not match";
      isValid = false;
    }
    if (!acceptedTerms) {
      newErrors.terms = "You must accept the Terms & Conditions";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleSignUp = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        displayName: name,
        email: email,
        overallBudget: 0,
        amountSpent: 0,
        createdAt: new Date()
      });

      setLoading(false);
      setStatusType("success");
      setSuccessModalVisible(true);
      setSuccessMessage("Successfully Signed Up!");
      setTimeout(() => {
        handleModalClose();
      }, 1500);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setStatusType("error");
        setSuccessMessage(error.message || "Email is already in use");
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
        }, 1500);
      } else {
        setStatusType("error");
        setSuccessMessage(error.message || "Failed to create account. Please try again.");
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
        }, 1500);
      }
      setLoading(false);
    }
  };


  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22ab54" />
      </SafeAreaView>
    );
  }
  const handleModalClose = () => {
    setSuccessModalVisible(false);
    router.push("/signin");
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#aaa"
            underlineColorAndroid="transparent"
            selectionColor="#22ab54"
          />
        </View>
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}


        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
            underlineColorAndroid="transparent"
            selectionColor="#22ab54"
          />
        </View>
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}


        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
            underlineColorAndroid="transparent"
            selectionColor="#22ab54"
          />
        </View>
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}


        <View style={styles.inputRow}>
          <Ionicons name="lock-open-outline" size={20} color="#444" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholderTextColor="#aaa"
            underlineColorAndroid="transparent"
            selectionColor="#22ab54"
          />
        </View>
        {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}


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
        {errors.terms && <Text style={styles.error}>{errors.terms}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>{loading ? "Creating user..." : "Create Account"}</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.small}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signin')}>
            <Text style={styles.link}> Sign in</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  input: {
    flex: 1,
    height: 45,
    color: '#333',
    backgroundColor: '#fff',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  termsText: {
    marginLeft: 8,
    color: '#333',
  },
  link: {
    color: '#22ab54',
    fontWeight: '600',
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
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
});


