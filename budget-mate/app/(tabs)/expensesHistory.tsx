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
                  <View style={{flex: 1}}>
                    <Text style={styles.expenseTitle}>{item.category}</Text>
                    <Text>{item.date}</Text>
                    <Text>{item.note}</Text>
                   </View>
                   <View style = { styles.rightColumn}>
                  <Text style={styles.expenseAmount}>${item.amount}</Text>
                  <Text>{item.payeeName}</Text>
                   <Text>{item.paymentType}</Text>
                   </View>
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
  container: { flex: 1, 
    backgroundColor: "#f7f7f7", 
    paddingHorizontal: 20, 
    paddingTop: 20 
  },
  title: { 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginVertical: 20 
  },
   contentContainer: { 
    flex: 1
 },
 noExpenses: { 
  fontSize: 16, 
  textAlign: "center",
  marginTop: 300
 },
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
    elevation: 5 
  },
  expenseTitle: { 
    fontWeight: "bold",
    fontSize: 20,
  },
  expenseAmount: { 
    fontWeight: "bold",
    fontSize: 20, 
  },
  total: { 
    flexDirection: "row", 
    justifyContent: "space-between",  
    backgroundColor: "#6DB993", 
    borderRadius: 8, 
    padding: 20,
    marginTop: 10
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  }
 
});
