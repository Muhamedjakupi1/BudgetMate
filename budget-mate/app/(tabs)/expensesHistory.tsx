import React, {useState, useEffect, useCallback} from "react";
import { View,  Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
import { doneExpenses } from "../sharedData";
import { useFocusEffect } from "expo-router";

export default function ExpensesHistory() {
 const[data, setData] = useState(doneExpenses);
 const[total, setTotal] = useState(0);
 useFocusEffect(
  useCallback(()=>{
    console.log("Done expenses: ", doneExpenses)
  setData([...doneExpenses]);

  const totalAmount = doneExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount), 0
  );
  setTotal(totalAmount)
}, []
 )
);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>✅ Expenses History</Text>
      <View>
      {data.length === 0 ? (
        <Text style={styles.noExpenses}>No expenses done yet</Text>
      ) : (
        <>
       <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <Text>{item.title}</Text>
              <Text>${item.amount}</Text>
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
  container: {
        flex: 1,
        backgroundColor: "#f7f7f7",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
  title: { 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center",
    marginBottom: 20, 
    marginTop: 20
  },
  noExpenses:{
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
    alignItems: "center",
    // iOS 
    shadowColor: "#000",
    shadowOffset: { width: 1, height:  7},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    // Android 
    elevation: 5,
    },
  item: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 10, 
    backgroundColor: "#eee", 
    marginBottom: 10, 
    borderRadius: 8 
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#6DB993",
    marginBottom: 10,
    borderRadius: 8,
    // iOS 
    shadowColor: "#000",
    shadowOffset: { width: 1, height:  7},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    // Android 
    elevation: 5,
  }
});
