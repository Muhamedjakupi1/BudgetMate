import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import { useBudget } from "../../constants/budgetContext";

export default function HomePage() {
  const { transactions, balance, deleteTransaction, markAsDone } = useBudget();
  const pendingExpenses = transactions.filter(t => t.type === "expense" && !t.done);

  const renderExpense = ({ item }: any) => (
    <View style={styles.expenseItem}>
      <View>
        <Text style={styles.expenseTitle}>{item.category}</Text>
        <Text style={styles.expenseAmount}>${item.amount}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: "#FF3B30" }]} onPress={() => deleteTransaction(item.id)}>
          <Text style={{ color: "white" }}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: "#34C759" }]} onPress={() => markAsDone(item.id)}>
          <Text style={{ color: "white" }}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <Text style={styles.budgetText}>💵 Budget: ${balance}</Text>
      </View>
      {pendingExpenses.length > 0 ? (
      <FlatList
        data={pendingExpenses.sort((a, b) => b.id.localeCompare(a.id))}
        keyExtractor={(item) => item.id}
        renderItem={renderExpense}
        contentContainerStyle={styles.listContainer}
      />
      ) : 
      (
        <View style={styles.noExpenseContainer}>
            <Text style={styles.noExpenseEmoji}>🎉</Text>
            <Text style={styles.noExpenseTitle}>No Pending Expenses!</Text>
            <Text style={styles.noExpenseSubtitle}>
                All your expenses are settled{"\n"}
                Add some income to get started
            </Text>
        </View>
      )
      }
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
    header: { 
        flexDirection: "row", 
        justifyContent: "center", 
        alignItems: "center", 
        marginBottom: 20 
},
    budgetText: { 
        fontSize: 18, 
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
        elevation: 5 
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
        gap: 10 },
    btn: { 
        paddingHorizontal: 15, 
        paddingVertical: 8, 
        borderRadius: 5 
    },
    noExpenseContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noExpenseEmoji: {
        fontSize: 50,
        marginBottom: 15,
    },
    noExpenseTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E8B57',
        textAlign: 'center',
        marginBottom: 10,
    },
    noExpenseSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
});
