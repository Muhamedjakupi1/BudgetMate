import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";

type Expenses = {
    id: string;
    title: string;
    amount: number;
    done: boolean;
}

export default function HomePage() {
    
    const [ budget, setBudget ] = useState(0);
    const [expenses, setExpenses] = useState<Expenses[]>([
        { id: "1", title: "Groceries", amount: 60, done: false },
        { id: "2", title: "Internet", amount: 25, done: true },
        { id: "3", title: "Electricity", amount: 40, done: false },
    ]);

    const renderExpense = ({ item }: { item: Expenses }) => (
        <View style={styles.expenseItem}>
            <View>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                <Text style={styles.expenseAmount}>${item.amount}</Text>
            </View>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.btn, {backgroundColor: "#007BFF"}]}>
                    <Text style={{ color: "white" }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, {backgroundColor: "#FF3B30"}]}>
                    <Text style={{ color: "white" }}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, {backgroundColor: "#34C759"}]}>
                    <Text style={{ color: "white" }}>Done</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.budgetText}>💰 Budget: ${budget}</Text>
                <TouchableOpacity><Text style={styles.headerButton}>👤 Profile</Text></TouchableOpacity>
            </View>
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item} ) => renderExpense({item})}
                contentContainerStyle={styles.listContainer}
            />
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
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerButton: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007AFF",
    },
    budgetText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    listContainer: {
        paddingBottom: 20,
        paddingTop: 10,
        paddingHorizontal: 10,
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
    expenseTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    expenseAmount: {
        fontSize: 14,
        color: "#777",
    },
    buttonsContainer: {
        flexDirection: "row",
        gap: 10,
    },
    btn: {
        backgroundColor: "#eee",
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 5,
    },
});