import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormInput from '../../components/ui/textinput';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, getDoc, addDoc, collection, updateDoc, getDocs, Timestamp, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from '../../context/AuthContext';
import StatusModal from '../../components/ui/statusModal';
import { useRouter } from 'expo-router';
import * as Notifications from "expo-notifications";
import { useTabAnimation } from "../hooks/tabAnimation";
import { Animated } from "react-native";

const categoryColors: Record<string, string> = {
  Transport: '#E53935',
  'Food and Drink': '#FDD835',
  'Home Bills': '#518e59ff',
  Entertainment: '#1E88E5',
  Shopping: '#8E24AA',
  Health: '#D81B60',
  Other: '#757575',
  Salary: '#FF5722',
  Freelance: '#FFC107',
  Investment: '#4CAF50',
  Gift: '#03A9F4',
};

const paymentOptions = ['Cash', 'Card'];

const expenseCategories = ['Transport', 'Food and Drink', 'Home Bills', 'Entertainment', 'Shopping', 'Health', 'Other'];

const AddTransaction: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const { opacity, scale } = useTabAnimation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const minDateStr = toLocalYMD(today);

  const switchType = (next: 'income' | 'expense') => {
    setType(next);
    setCategory('');
    setPaymentType('');
    setNote('');
    setPayeeName('');
    setCategoryOpen(false);
    setPaymentOpen(false);
    setShowDuePicker(false);
    setDueDate(null);
    setAmount('');
  };


  const handleSave = async () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusType("error");
      setSuccessMessage("Enter a valid amount!");
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 1500);
      return;
    }

    if (!user) {
      setStatusType("error");
      setSuccessMessage("User not logged in!");
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 1500);
      return;
    }

    if (type === "expense" && !category) {
      setStatusType("error");
      setSuccessMessage("Please select a category!");
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 1500);
      return;
    }

    if (type === "expense" && !dueDate) {
      setStatusType("error");
      setSuccessMessage("Please select a due date!");
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 1500);
      return;
    }

    const userRef = doc(db, "users", user.uid);

    let overallBefore = 0;

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        setStatusType("error");
        setSuccessMessage("User data not found!");
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 1500);
        return;
      }

      overallBefore = userSnap.data()?.overallBudget ?? 0;

      const transactionData: any = {
        type,
        amount: numAmount,
        date: serverTimestamp(),
        category: type === "expense" ? category : null,
        note: type === "expense" ? note : null,
        paymentType: type === "expense" ? paymentType : null,
        payeeName: type === "expense" ? payeeName : null,
        done: false,
        ...(type === "expense" && dueDate ? { dueDate: Timestamp.fromDate(dueDate) } : {}),
      };

      await addDoc(collection(db, "users", user.uid, "transactions"), transactionData);

      if (type === "income") {
        await updateDoc(userRef, { overallBudget: overallBefore + numAmount });
      }

      setAmount("");
      setCategory("");
      setNote("");
      setPaymentType("");
      setPayeeName("");
      setCategoryOpen(false);
      setPaymentOpen(false);
      setDueDate(null);
      setShowDuePicker(false);

      setStatusType("success");
      setSuccessMessage(type === "expense" ? "Expense saved!" : "Income saved!");
      setSuccessModalVisible(true);

      setTimeout(() => {
        setSuccessModalVisible(false);
        router.push("/(tabs)");
      }, 900);
    } catch (error) {
      console.error("Transaction save failed:", error);
      setStatusType("error");
      setSuccessMessage("Could not save transaction. Please try again.");
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 900);
      return;
    }

    try {
      if (type === "expense") {
        const LOW_THRESHOLD = 10;
        const remaining = overallBefore;

        if (remaining <= LOW_THRESHOLD) {
          await addDoc(collection(db, "users", user.uid, "notifications"), {
            type: "low_budget",
            channel: "in_app",
            title: "Low budget warning",
            body: `Your remaining budget is €${remaining.toFixed(2)}.`,
            createdAt: serverTimestamp(),
            scheduledAt: serverTimestamp(),
            read: false,
            status: "active",
            meta: { remaining, threshold: LOW_THRESHOLD },
          });
        }

        const missing: string[] = [];
        if (!note.trim()) missing.push("note");
        if (!payeeName.trim()) missing.push("payee name");
        if (!paymentType) missing.push("payment type");

        if (missing.length > 0) {
          await addDoc(collection(db, "users", user.uid, "notifications"), {
            type: "follow_up",
            channel: "in_app",
            title: "Complete your expense details",
            body: `Please add: ${missing.join(", ")}.`,
            createdAt: serverTimestamp(),
            scheduledAt: serverTimestamp(),
            read: false,
            status: "active",
            meta: { missing },
          });
        }

        if (dueDate) {
          const twoHoursBefore = new Date(dueDate.getTime() - 2 * 60 * 60 * 1000);
          const scheduledAt =
            twoHoursBefore.getTime() > Date.now()
              ? twoHoursBefore
              : new Date(Date.now() + 5 * 60 * 1000);

          const secondsUntil = Math.max(
            5,
            Math.floor((scheduledAt.getTime() - Date.now()) / 1000)
          );

          const expoId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Bill reminder",
              body: `${category} bill is due on ${dueDate.toDateString()}.`,
              sound: true,
              data: { category, amount: numAmount },
            },
            trigger: { seconds: secondsUntil, repeats: false } as any,
          });

          await addDoc(collection(db, "users", user.uid, "notifications"), {
            type: "bill_reminder",
            channel: "push",
            title: "Bill reminder",
            body: `${category} bill is due on ${dueDate.toDateString()}.`,
            createdAt: serverTimestamp(),
            scheduledAt: Timestamp.fromDate(scheduledAt),
            expoNotificationId: expoId,
            read: false,
            status: "active",
            meta: { dueDate: dueDate.toISOString(), category, amount: numAmount },
          });
        }
      }
    } catch (e) {
      console.warn("Notifications failed (transaction saved):", e);
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [{ scale }],
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.container}>

          <View style={styles.navbar}>
            <TouchableOpacity
              style={[styles.navItem, type === 'expense' && styles.activeNav]}
              onPress={() => switchType('expense')}
            >
              <Text style={styles.navText}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navItem, type === 'income' && styles.activeNav]}
              onPress={() => switchType('income')}
            >
              <Text style={styles.navText}>Income</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form}>
            <Text style={styles.label}>Amount</Text>

            <FormInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount (€)"
            />

            {type === 'expense' && (
              <>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                  style={[styles.dropdown, { backgroundColor: category ? categoryColors[category] : '#fff' }]}
                  onPress={() => setCategoryOpen(!isCategoryOpen)}
                >
                  <Text style={{ color: category ? 'white' : '#888', fontWeight: '600' }}>
                    {category || 'Select category'}
                  </Text>
                </TouchableOpacity>
                {isCategoryOpen && (
                  <View style={styles.dropdownList}>
                    {expenseCategories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.dropdownItem, { backgroundColor: categoryColors[cat] || '#ccc' }]}
                        onPress={() => {
                          setCategory(cat);
                          setCategoryOpen(false);
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={styles.label}>Payment Type</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => setPaymentOpen(!isPaymentOpen)}>
                  <Text style={{ color: paymentType ? '#000' : '#888', fontWeight: '600' }}>
                    {paymentType || 'Select payment method'}
                  </Text>
                </TouchableOpacity>
                {isPaymentOpen && (
                  <View style={styles.dropdownList}>
                    {paymentOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.dropdownItem, { backgroundColor: '#518e59ff' }]}
                        onPress={() => {
                          setPaymentType(opt);
                          setPaymentOpen(false);
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '600' }}>{opt}</Text>
                      </TouchableOpacity>

                    ))}
                  </View>
                )}

                <Text style={styles.label}>Due date</Text>

                {Platform.OS === 'web' ? (
                  <View style={styles.webDateWrapper}>
                    <input
                      type="date"
                      min={minDateStr}
                      value={dueDate ? toLocalYMD(dueDate) : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) return setDueDate(null);

                        const [y, m, d] = v.split("-").map(Number);
                        const picked = new Date(y, m - 1, d);
                        picked.setHours(0, 0, 0, 0);

                        if (picked < today) {
                          setDueDate(today);
                          return;
                        }

                        setDueDate(picked);
                      }}
                      style={styles.webDateInput as any}
                    />

                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setShowDuePicker(true)}
                    >
                      <Text style={{ color: dueDate ? '#000' : '#888', fontWeight: '600' }}>
                        {dueDate ? dueDate.toDateString() : 'Select due date'}
                      </Text>
                    </TouchableOpacity>

                    {showDuePicker && (
                      <View style={styles.iosPickerContainer}>
                          <DateTimePicker
                            value={dueDate ?? today}
                            mode="date"
                            display="spinner"
                            minimumDate={today}
                            onChange={(event, selectedDate) => {
                              setShowDuePicker(false);
                              if ((event as any)?.type === "dismissed") return;

                              if (selectedDate) {
                                const picked = new Date(selectedDate);
                                picked.setHours(0, 0, 0, 0);

                                if (picked < today) {
                                  setDueDate(today);
                                  return;
                                }

                                setDueDate(picked);
                              }
                            }}
                          />

                      </View>
                    )}
                  </>
                )}


                <Text style={styles.label}>Note</Text>
                <FormInput value={note} onChangeText={setNote} placeholder="Enter note" />
                <Text style={styles.label}>Payee Name</Text>
                <FormInput value={payeeName} onChangeText={setPayeeName} placeholder="Enter payee name" />
              </>
            )}

            <Pressable
              onPress={handleSave}
              style={{
                backgroundColor: "#34aac7",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: 'bold' }}>
                Save Transaction
              </Text>
            </Pressable>

          </ScrollView>
        </View>

        <StatusModal
          visible={successModalVisible}
          message={successMessage}
          type={statusType}
        />
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7'
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16
  },
  navItem: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeNav: {
    backgroundColor: '#34aac7',
  },
  navText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  form: {
    paddingBottom: 40
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
    color: '#333'
  },
  dropdownList: {
    marginTop: 8
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 2
  },
  dropdown: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  webDateWrapper: {
    position: 'relative',
    width: '100%',
  },
  webDateIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    pointerEvents: 'none',
  },

  webDateInput: {
    width: '100%',
    height: 48,
    paddingLeft: 14,
    paddingRight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    backgroundColor: '#fff',

    // @ts-ignore
    boxSizing: 'border-box',
    // @ts-ignore
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  iosPickerContainer: {
    marginTop: 8,
    backgroundColor: '#888',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },

});

export default AddTransaction;
