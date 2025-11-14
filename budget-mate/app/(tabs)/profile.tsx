import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
};

const Profile = () => {
  const { user: currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const userName = currentUser?.displayName || 'No Name';
  const userEmail = currentUser?.email || 'No Email';
  const profilePic = currentUser?.photoURL
    ? { uri: currentUser.photoURL }
    : require('../../assets/images/budgetmate-logo.png');

  useEffect(() => {
    if (!currentUser) return;

    const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
    const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || 0,
        };
      });
      setTransactions(docs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const totalDoneExpenses = transactions.filter((t) => t.type === 'expense').length;

  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    router.replace('.././(auth)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.sContainer}>
        <View style={styles.profileHeader}>
          <Image source={profilePic} style={styles.profileImage} />
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>${balance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Budget</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>${totalExpense.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalDoneExpenses}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF3B30' }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7f7' },
  sContainer: { 
    padding: 20, 
    alignItems: 'center' },
  profileHeader: { 
    alignItems: 'center', 
    marginBottom: 30 },
  profileImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 15 },
  userName: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333' },
  userEmail: { 
    fontSize: 16, 
    color: '#777' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statNumber: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 5 },
  statLabel: { 
    fontSize: 14, 
    color: '#777' },
  button: {
    width: '100%',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 },
});
