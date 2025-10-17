import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Button,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormInput from '../../components/ui/textinput';
import { useBudget } from "../../constants/budgetContext";

const categoryColors: Record<string, string> = {
  Transport: '#E53935',
  'Food and Drink': '#FDD835',
  'Home Bills': '#43A047',
  Entertainment: '#1E88E5',
  Shopping: '#8E24AA',
  Health: '#D81B60',
  Other: '#757575',

  Salary: '#FF5722',
  Freelance: '#FFC107',
  Investment: '#4CAF50',
  Gift: '#03A9F4',
};

const AddTransaction: React.FC = () => {
  const { addIncome, addExpense, balance } = useBudget();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const expenseCategories = [
    'Transport',
    'Food and Drink',
    'Home Bills',
    'Entertainment',
    'Shopping',
    'Health',
    'Other',
  ];
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

  const options = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount!');
      return;
    }
    if (type === 'expense' && numAmount > balance) {
      alert('Insufficient funds!');
      return;
    }
    const transaction = {
      type,
      date: date.toDateString(),
      amount: numAmount,
      category,
      note,
      paymentType,
      payeeName,
    };
    if (type === 'income') {
      addIncome(numAmount);
    } else {
      addExpense(numAmount);
    }
    console.log('Transaction Saved:', transaction);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white"></StatusBar>
      <View style={styles.container}>
        {/* Navbar for Expense / Income */}
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

        {/* Form */}
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Date</Text>
          <FormInput value={date.toDateString()} onChangeText={() => {}} editable={false} />

          <Text style={styles.label}>Amount</Text>
          <FormInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount"
          />

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={[
              styles.dropdown,
              { backgroundColor: category ? categoryColors[category] : '#fff' },
            ]}
            onPress={() => setDropdownOpen(!isDropdownOpen)}
          >
            <Text style={{ color: category ? 'white' : '#000', fontWeight: '600' }}>
              {category || 'Select category'}
            </Text>
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {options.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownItem,
                    { backgroundColor: categoryColors[item] || '#ccc' },
                  ]}
                  onPress={() => {
                    setCategory(item);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Note</Text>
          <FormInput value={note} onChangeText={setNote} placeholder="Enter note" />

          <Text style={styles.label}>Payment Type</Text>
          <FormInput value={paymentType} onChangeText={setPaymentType} placeholder="Enter payment type" />

          <Text style={styles.label}>Payee / Payer Name</Text>
          <FormInput value={payeeName} onChangeText={setPayeeName} placeholder="Enter name" />

          <View style={{ marginTop: 20 }}>
            <Button
              title="Save Transaction"
              onPress={handleSave}
              color={Platform.OS === 'ios' ? '#007AFF' : '#4ECDC4'}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7', // light background
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  navItem: {
    flex: 1, 
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  activeNav: {
    backgroundColor: '#8080ff',
  },
  navText: {
    fontWeight: 'bold',
    color: '#000',
  },
  form: {
    paddingBottom: 40,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    marginTop: 8,
  },
  dropdownItem: {
  padding: 12,
  borderRadius: 8,
  marginVertical: 2,
  elevation: 3, // small shadow for Android
  shadowColor: '#000', // shadow for iOS
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 3,
},
dropdown: {
  padding: 14,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#ccc',
},
});

export default AddTransaction;
