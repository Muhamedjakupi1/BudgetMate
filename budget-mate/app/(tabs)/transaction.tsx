import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormInput from '../../components/ui/textinput';
import { doc, getDoc, addDoc, collection, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from '../../context/AuthContext';
import StatusModal from '../../components/ui/statusModal';
import { useRouter } from 'expo-router';

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

    if (type === 'expense' && (!category)) {
      setStatusType("error");
      setSuccessMessage("Please fill in all required fields for expense!");
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 1500);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setStatusType("error");
        setSuccessMessage("User data not found!");
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 1500);
        return;
      }

      const transactionsSnap = await getDocs(collection(db, 'users', user.uid, 'transactions'));
      let totalIncome = 0;
      let totalExpense = 0;

      transactionsSnap.forEach((doc) => {
        const t = doc.data();
        if (t.type === 'income') totalIncome += t.amount;
        if (t.type === 'expense' && t.done) totalExpense += t.amount;
      });

      const currentBudget = totalIncome - totalExpense;

      if (type === 'expense' && numAmount > currentBudget) {
        setStatusType("error");
        setSuccessMessage(`⚠️ Not enough budget! You have ${currentBudget} left.`);
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 1500);
        return;
      }

      const transactionData = {
        type,
        amount: numAmount,
        date: new Date(),
        category: type === 'expense' ? category : null,
        note: type === 'expense' ? note : null,
        paymentType: type === 'expense' ? paymentType : null,
        payeeName: type === 'expense' ? payeeName : null,
        done: false
      };

      await addDoc(collection(db, 'users', user.uid, 'transactions'), transactionData);

      let newOverallBudget = currentBudget;
      if (type === 'income') {
        newOverallBudget = currentBudget + numAmount;
      }

      await updateDoc(userRef, { overallBudget: newOverallBudget });

      setAmount('');
      setCategory('');
      setNote('');
      setPaymentType('');
      setPayeeName('');
      setCategoryOpen(false);
      setPaymentOpen(false);

      setStatusType("success");
      setSuccessMessage(type === 'expense' ? "Expense has been saved successfully!" : "Income has been saved successfully!");
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 1500);

    } catch (error) {
      console.error('Error saving transaction:', error);
      setStatusType("error");
      setSuccessMessage("Couldn't save transaction. Check budget and try again.");
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 1500);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.container}>

        <View style={styles.navbar}>
          <TouchableOpacity
            style={[styles.navItem, type === 'expense' && styles.activeNav]}
            onPress={() => setType('expense')}
          >
            <Text style={styles.navText}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navItem, type === 'income' && styles.activeNav]}
            onPress={() => setType('income')}
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

              <Text style={styles.label}>Note</Text>
              <FormInput value={note} onChangeText={setNote} placeholder="Enter note" />
              <Text style={styles.label}>Payee Name</Text>
              <FormInput value={payeeName} onChangeText={setPayeeName} placeholder="Enter payee name" />
            </>
          )}

          <View style={{ marginTop: 20 }}>
            <Button title={"Save Transaction"} onPress={handleSave} color="#518e59ff" />
          </View>
        </ScrollView>
      </View>

      <StatusModal
        visible={successModalVisible}
        message={successMessage}
        type={statusType}
      />
    </SafeAreaView>
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
    backgroundColor: '#518e59ff'
  },
  navText: {
    fontWeight: 'bold',
    color: '#000'
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
});

export default AddTransaction;
