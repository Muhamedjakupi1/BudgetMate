import React, { useEffect, useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ConfirmModal from '../../components/ui/modalWithButtons';
import { Transaction, generateRandomTransactions } from "../../components/fakeTransaction";
import { Ionicons } from '@expo/vector-icons';

export default function HomePage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<'delete' | 'done' | null>(null);
  const [firebaseTransactions, setFirebaseTransactions] = useState<Transaction[]>([]);
  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "transactions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trans: Transaction[] = [];
      let totalBalance = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as Transaction;
        trans.push({
          id: doc.id,
          type: data.type,
          amount: data.amount,
          category: data.category,
          done: data.done,
          note: data.note,
          paymentType: data.paymentType,
          payeeName: data.payeeName,
          date: data.date,
          isExternalApi: false,
        });
        if (data.type === "income") totalBalance += data.amount;
        if (data.type === "expense" && data.done) totalBalance -= data.amount;
      });
      setFirebaseTransactions(trans);
      setBalance(totalBalance);
    });

    return () => unsubscribe();
  }, [user]);

  const addRandomTransactions = async () => {
    setLoading(true);
    try {
      const newTxns = await generateRandomTransactions();
      setApiTransactions((prev) => [...prev, ...newTxns]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (txn: Transaction) => {
    if (!user) return;
    try {
      if (txn.isExternalApi) {
        setApiTransactions((prev) => prev.filter((t) => t.id !== txn.id));
      } else if (user) {
        await deleteDoc(doc(db, "users", user.uid, "transactions", txn.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAsDone = async (txn: Transaction) => {
    if (!user) return;
    try {
      if (txn.isExternalApi) {
        setApiTransactions(prev =>
          prev.map((t) => (t.id === txn.id ? { ...t, done: true } : t))
        );
        return;
      }

      const transactionRef = doc(db, "users", user.uid, "transactions", txn.id);
      const userRef = doc(db, 'users', user.uid);

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      const currentOverallBudget = userSnap.data().overallBudget || 0;

      if (txn.amount > currentOverallBudget) {
        setModalVisible(false);
        setModalAction(null);

        setStatusMessage("⚠️ Not enough budget to complete this expense!");
        setStatusModalVisible(true);

        return;
      }

      await updateDoc(transactionRef, { done: true });

      const newOverallBudget = currentOverallBudget - txn.amount;
      await updateDoc(userRef, { overallBudget: newOverallBudget });

    } catch (err) {
      console.error(err);
    }
  };


  const handleEditPress = (txn: Transaction) => {
    if (!txn.isExternalApi) router.push(`/expense/${txn.id}`)
  };

  const handleDeletePress = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setModalAction('delete');
    setModalVisible(true);
  };

  const handleDonePress = (txn: Transaction) => {
    if (txn.isExternalApi) return;
    setSelectedTransaction(txn);
    setModalAction("done");
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedTransaction || !user) return;

    if (modalAction === 'delete') {
      await deleteTransaction(selectedTransaction);
    } else if (modalAction === 'done') {
      await markAsDone(selectedTransaction);
    }

    setModalVisible(false);
    setSelectedTransaction(null);
    setModalAction(null);
  };

  const allTransactions = [...firebaseTransactions, ...apiTransactions].sort(
    (a, b) => (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0)
  );

  const pendingExpenses = allTransactions.filter(
    (t) => t.type === "expense" && !t.done
  );

  const renderExpense = ({ item }: { item: Transaction }) => (
    <View style={styles.expenseItem}>
      <View>
        <Text style={styles.expenseTitle}>{item.category}
          {item.isExternalApi ? "(FAKE)" : ""}</Text>
        <Text style={styles.expenseAmount}>€{item.amount}</Text>
        {item.note && <Text style={styles.expenseNote}>{item.note}</Text>}
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#d41309ff" }]}
          onPress={() => handleDeletePress(item)}
        >
          <Text style={{ color: "white", fontWeight: 500 }}>Delete</Text>
        </TouchableOpacity>
        {!item.isExternalApi && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#518e59ff" }]}
            onPress={() => handleDonePress(item)}
          >
            <Text style={{ color: "white", fontWeight: 500 }}>Done</Text>
          </TouchableOpacity>
        )}
        {!item.isExternalApi && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#34aac7" }]}
            onPress={() => handleEditPress(item)}
          >
            <Text style={{ color: "white" , fontWeight: 500}}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.budgetText}>
          <Ionicons name="cash" size={24} color="green" />
          <View style={{ width: 8 }} />
           Budget: €{balance.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#34aac7", marginBottom: 20 }]}
        onPress={addRandomTransactions}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "white" }}>Add 5 Random Expenses (API)</Text>
        )}
      </TouchableOpacity>

      {pendingExpenses.length > 0 ? (
        <FlatList
          data={pendingExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpense}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.noExpenseContainer}>
          <Text style={styles.noExpenseEmoji}>🎉</Text>
          <Text style={styles.noExpenseTitle}>No Pending Expenses!</Text>
          <Text style={styles.noExpenseSubtitle}>
            All your expenses are settled{"\n"}Add some income to get started
          </Text>
        </View>
      )}

      <ConfirmModal
        visible={modalVisible}
        type={modalAction === 'delete' ? 'error' : 'success'}
        message={
          modalAction === 'delete'
            ? 'Are you sure you want to delete this expense?'
            : 'Mark this transaction as done?'
        }
        showConfirm={true}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirm}
      />
      <ConfirmModal
        visible={statusModalVisible}
        type="error"
        message={statusMessage}
        showConfirm={false}      
        onClose={() => setStatusModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 20,
    paddingTop: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },
  budgetText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333"
  },
  listContainer: {
    paddingBottom: 20
  },
  expenseItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333"
  },
  expenseAmount: {
    fontSize: 14,
    color: "#777"
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5
  },
  noExpenseContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  noExpenseEmoji: {
    fontSize: 50,
    marginBottom: 15
  },
  noExpenseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#518e59ff",
    textAlign: "center",
    marginBottom: 10
  },
  noExpenseSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22
  },
  expenseNote: {
    fontSize: 12,
    color: "#555",
    marginTop: 4
  },
});
