import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";

type Errors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  income?: string;
  currency?: string;
  terms?: string;
};

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [income, setIncome] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [showCurrencyList, setShowCurrencyList] = useState(false);
  const [savingsGoal, setSavingsGoal] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const router = useRouter();

  const currencies = [
    { label: "USD - $", value: "USD" },
    { label: "EUR - €", value: "EUR" },
    { label: "GBP - £", value: "GBP" },
    { label: "JPY - ¥", value: "JPY" },
    { label: "AUD - $", value: "AUD" },
  ];

  const validate = () => {
    const newErrors: Errors = {};
    if (!fullName) newErrors.fullName = "Full Name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!income || isNaN(Number(income)) || Number(income) <= 0)
      newErrors.income = "Valid monthly income is required";
    if (!currency) newErrors.currency = "Currency is required";
    if (!termsAccepted) newErrors.terms = "You must accept the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (!validate()) return;

    Alert.alert("Success", `Account created for ${fullName}!`);
    router.replace("/(tabs)");

    // reset
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIncome("");
    setCurrency("USD");
    setSavingsGoal("");
    setTermsAccepted(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={[styles.input, errors.fullName && styles.errorInput]}
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={[styles.input, errors.email && styles.errorInput]}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, errors.password && styles.errorInput]}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={[styles.input, errors.confirmPassword && styles.errorInput]}
      />
      {errors.confirmPassword && (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      )}

      <TextInput
        placeholder="Monthly Income"
        value={income}
        onChangeText={setIncome}
        keyboardType="numeric"
        style={[styles.input, errors.income && styles.errorInput]}
      />
      {errors.income && <Text style={styles.errorText}>{errors.income}</Text>}

      <View style={[styles.dropdownContainer, errors.currency && styles.errorInput]}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowCurrencyList(!showCurrencyList)}
        >
          <Text style={styles.dropdownText}>
            {currencies.find((c) => c.value === currency)?.label || "Select Currency"}
          </Text>
        </TouchableOpacity>

        {showCurrencyList && (
          <View style={styles.dropdownList}>
            {currencies.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setCurrency(item.value);
                  setShowCurrencyList(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {errors.currency && <Text style={styles.errorText}>{errors.currency}</Text>}

      <TextInput
        placeholder="Savings Goal (optional)"
        value={savingsGoal}
        onChangeText={setSavingsGoal}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.termsContainer}>
        <Switch value={termsAccepted} onValueChange={setTermsAccepted} />
        <Text style={styles.termsText}>I accept the Terms & Conditions</Text>
      </View>
      {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#000000",
  },
  dropdownContainer: {
    position: "relative",
    marginBottom: 10,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
  },
  dropdownText: {
    fontSize: 16,
    color: "#000000",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#90ee90",
    borderRadius: 8,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000000",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#3DBA6F",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#222",
  },
});
