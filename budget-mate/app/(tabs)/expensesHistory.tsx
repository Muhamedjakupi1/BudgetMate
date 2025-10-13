import React, {useState, useEffect, useCallback} from "react";
import { View,  Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
import { doneExpenses } from "../sharedData";
import { useFocusEffect } from "expo-router";

export default function ExpensesHistory() {
 const[data, setData] = useState(doneExpenses);
 useFocusEffect(
  useCallback(()=>{
  setData([...doneExpenses]);}, []
 )
);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>✅ Expenses History</Text>
      {data.length === 0 ? (
        <Text>No expenses done yet</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{item.title}</Text>
              <Text>${item.amount}</Text>
            </View>
          )}
        />
      )}
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
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  item: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 10, 
    backgroundColor: "#eee", 
    marginBottom: 10, 
    borderRadius: 8 
  },
});
