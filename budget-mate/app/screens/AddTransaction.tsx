import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Button, StyleSheet } from 'react-native';
import Dropdown from '../../components/ui/dropdown';
import FormInput from '../../components/ui/textinput';
import { RouteProp, useRoute } from '@react-navigation/native';

type AddTransactionRouteProp = RouteProp<Record<string, { type?: 'income' | 'expense' }>, string>;

const AddTransaction: React.FC = () => {
  const route = useRoute<AddTransactionRouteProp>();
  const initialType = route.params?.type || 'expense';

  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [date, setDate] = useState(new Date());

  const expenseCategories = ['Transport', 'Food', 'Bills', 'Entertainment', 'Shopping', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Business', 'Gift', 'Other'];

  const handleSave = () => {
    const transaction = { type, date: date.toDateString(), amount, category, note, paymentType, payeeName };
    console.log('Transaction Saved:', transaction);
  };

  return (
    <View style={{ flex: 1 }}>
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
        <Text>Date</Text>
        <FormInput value={date.toDateString()} onChangeText={() => {}} editable={false} />

        <Text>Amount</Text>
        <FormInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Enter amount" />

        <Text>Category</Text>
        <Dropdown
          options={type === 'expense' ? expenseCategories : incomeCategories}
          selectedValue={category}
          onSelect={setCategory}
          placeholder="Select category"
        />

        <Text>Note</Text>
        <FormInput value={note} onChangeText={setNote} placeholder="Enter note" />

        <Text>Payment Type</Text>
        <FormInput value={paymentType} onChangeText={setPaymentType} placeholder="Enter payment type" />

        <Text>Payee / Payer Name</Text>
        <FormInput value={payeeName} onChangeText={setPayeeName} placeholder="Enter name" />

        <Button title="Save Transaction" onPress={handleSave} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  navItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeNav: {
    backgroundColor: '#4ECDC4',
  },
  navText: {
    fontWeight: 'bold',
    color: '#000',
  },
  form: {
    padding: 20,
  },
});

export default AddTransaction;
