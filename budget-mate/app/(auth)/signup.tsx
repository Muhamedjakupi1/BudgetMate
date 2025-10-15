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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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

    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIncome("");
    setCurrency("USD");
    setSavingsGoal("");
    setTermsAccepted(false);
  };

  const renderInputField = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: "default" | "email-address" | "numeric" = "default",
    secureTextEntry: boolean = false,
    error: string | undefined,
    iconName: string
  ) => (
    <View style={[styles.inputContainer, error && styles.errorContainer]}>
      <Ionicons
        name={iconName as any}
        size={20}
        color={error ? "#ff6347" : "#777"}
        style={styles.icon}
      />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { outlineStyle: "none" }]} // removes web outline
        placeholderTextColor="#999"
        underlineColorAndroid="transparent" // removes Android black border
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Set up your profile to start your financial journey.
          </Text>

          {renderInputField(
            "Full Name",
            fullName,
            setFullName,
            "default",
            false,
            errors.fullName,
            "person-outline"
          )}
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}

          {renderInputField(
            "Email",
            email,
            setEmail,
            "email-address",
            false,
            errors.email,
            "mail-outline"
          )}
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {renderInputField(
            "Password",
            password,
            setPassword,
            "default",
            true,
            errors.password,
            "lock-closed-outline"
          )}
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {renderInputField(
            "Confirm Password",
            confirmPassword,
            setConfirmPassword,
            "default",
            true,
            errors.confirmPassword,
            "lock-closed-outline"
          )}
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {renderInputField(
            "Monthly Income",
            income,
            setIncome,
            "numeric",
            false,
            errors.income,
            "cash-outline"
          )}
          {errors.income && (
            <Text style={styles.errorText}>{errors.income}</Text>
          )}

          <View
            style={[styles.inputContainer, errors.currency && styles.errorContainer]}
          >
            <Ionicons
              name="globe-outline"
              size={20}
              color={errors.currency ? "#ff6347" : "#777"}
              style={styles.icon}
            />
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCurrencyList(!showCurrencyList)}
            >
              <Text style={styles.dropdownText}>
                {currencies.find((c) => c.value === currency)?.label ||
                  "Select Currency"}
              </Text>
            </TouchableOpacity>
            <Ionicons
              name={showCurrencyList ? "chevron-up-outline" : "chevron-down-outline"}
              size={18}
              color="#777"
            />
          </View>
          {errors.currency && (
            <Text style={styles.errorText}>{errors.currency}</Text>
          )}

          {showCurrencyList && (
            <View style={styles.dropdownList}>
              <FlatList
                data={currencies}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCurrency(item.value);
                      setShowCurrencyList(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.value}
              />
            </View>
          )}

          {renderInputField(
            "Savings Goal (optional)",
            savingsGoal,
            setSavingsGoal,
            "numeric",
            false,
            undefined,
            "trending-up-outline"
          )}

          <View style={styles.termsContainer}>
            <Switch
              trackColor={{ false: "#ccc", true: "#3DBA6F" }}
              thumbColor={termsAccepted ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              value={termsAccepted}
              onValueChange={setTermsAccepted}
            />
            <Text style={styles.termsText}>
              I accept the **Terms & Conditions**
            </Text>
          </View>
          {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  card: {
    marginHorizontal: 20,
    padding: 30,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    shadowColor: "#faf6f6ff",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
    color: "#2c3e50",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 55,
  },
  errorContainer: {
    borderColor: "#ff6347",
    borderWidth: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    height: "100%",
    borderWidth: 0, // remove border completely
  },
  errorText: {
    color: "#ff6347",
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 5,
  },
  dropdownButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  dropdownText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 10,
    marginHorizontal: 20,
    padding: 5,
    zIndex: 10,
    position: "absolute",
    top: 520,
    left: 0,
    right: 0,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  button: {
    backgroundColor: "#3DBA6F",
    padding: 18,
    borderRadius: 12,
    marginTop: 25,
    alignItems: "center",
    shadowColor: "#3DBA6F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
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
    paddingLeft: 5,
  },
  termsText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#7f8c8d",
  },
});
