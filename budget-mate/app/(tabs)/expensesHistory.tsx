import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useBudget } from "../../constants/budgetContext";

export default function ExpensesHistory() {
  const { doneExpenses } = useBudget();
  const [data, setData] = useState(doneExpenses);
  const [total, setTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setData(doneExpenses);
      setTotal(doneExpenses.reduce((sum, e) => sum + e.amount, 0));
    }, [doneExpenses])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>✅ Expenses History</Text>
      <View style={styles.contentContainer}>
        {data.length === 0 ? (
          <Text style={styles.noExpenses}>No expenses done yet</Text>
        ) : (
          <>
            <FlatList
              data={data.sort((a,b)=>b.id.localeCompare(a.id))}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.expenseItem}>
                  <View>
                    <Text style={styles.expenseTitle}>{item.category}</Text>
                    <Text>{item.note}</Text>
                    <Text>{item.payeeName}</Text>
                    <Text>{item.date}</Text>
                    <Text>{item.paymentType}</Text>
                  </View>
                  <Text style={styles.expenseAmount}>${item.amount}</Text>
                </View>
              )}
            />
            <View style={styles.total}>
              <Text>Total spent:</Text>
              <Text>${total}</Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7", paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  contentContainer: { flex: 1 },
  noExpenses: { fontSize: 16, textAlign: "center" },
  expenseItem: { backgroundColor: "#fff", borderRadius: 10, padding: 15, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", shadowColor: "#000", shadowOffset: { width: 1, height: 7 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 5 },
  expenseTitle: { fontWeight: "bold" },
  expenseAmount: { fontWeight: "bold", color: "#333" },
  total: { flexDirection: "row", justifyContent: "space-between", padding: 15, backgroundColor: "#6DB993", borderRadius: 8, marginTop: 10 },
});
