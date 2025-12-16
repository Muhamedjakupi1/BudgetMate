import React, {  useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';

export default function ExpensesHistory() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const q = query(collection(db, "users", user.uid, "transactions"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const expenseData: any[] = [];
        let totalAmount = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === "expense" && data.done === true) {
            expenseData.push({ id: doc.id, ...data });
            totalAmount += data.amount;
          }
        });

        setExpenses(expenseData.sort((a, b) => (b.date?.seconds ?? 0) - (a.date?.seconds ?? 0)));
        setTotal(totalAmount);
      });

      return () => unsubscribe();
    }, [user])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        <Ionicons name="checkmark-done-outline" size={24} color="green" /> 
        <View style={{ width: 8 }} />
        Expenses History</Text>
      <View style={styles.contentContainer}>
        {expenses.length === 0 ? (
          <Text style={styles.noExpenses}>No expenses done yet</Text>
        ) : (
          <>
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.expenseItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expenseTitle}>{item.category}</Text>
                    <Text>{item.date?.toDate?.().toLocaleDateString() ?? ''}</Text>
                    {item.dueDate && (
                      <Text>Due: {item.dueDate?.toDate?.().toLocaleDateString()}</Text>
                    )}
                    <Text>{item.note}</Text>
                  </View>
                  <View style={styles.rightColumn}>
                    <Text style={styles.expenseAmount}>€{item.amount.toFixed(2)}</Text>
                    <Text>{item.payeeName}</Text>
                    <Text>{item.paymentType}</Text>
                  </View>
                </View>
              )}
            />
            <View style={styles.total}>
              <Text>Total spent:</Text>
              <Text>€{total.toFixed(2)}</Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f7f7f7", 
    paddingHorizontal: 20, 
    paddingTop: 20 },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginVertical: 20 },
  contentContainer: { 
    flex: 1 },
  noExpenses: { 
    fontSize: 16, 
    textAlign: "center", 
    marginTop: 300 },
  expenseItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  expenseTitle: { 
    fontWeight: "bold", 
    fontSize: 20 },
  expenseAmount: { 
    fontWeight: "bold", 
    fontSize: 20 },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#34aac7",
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  rightColumn: { 
    alignItems: "flex-end", 
    justifyContent: "space-between" },
});
