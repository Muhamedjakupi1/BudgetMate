import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

export default function ExpensesHistoryPage({ route }: any) {
const doneExpenses = route.params?.doneExpenses || [];

 return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Expenses History</Text>
      {doneExpenses.length === 0 ? (
        <Text>No expenses done yet</Text>
      ) : (
        <FlatList
          data={doneExpenses}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{item.title}</Text>
              <Text>${item.amount}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#f7f7f7" 
},
  title: { fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 20 
},
  item: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 10, backgroundColor: "#eee", 
    marginBottom: 10, borderRadius: 8 
},
});
