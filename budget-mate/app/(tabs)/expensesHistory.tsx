import {  useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { collection, query, onSnapshot,serverTimestamp, getDocs, where, limit, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import useTabAnimation from "../hooks/tabAnimation";
import { Animated } from "react-native";


export default function ExpensesHistory() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const { opacity, scale } = useTabAnimation();

  const createWeeklySummaryIfMissing = async (totalAmount: number) => {
    if (!user) return;

    function startOfWeekMonday(d: Date) {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      const day = x.getDay(); 
      const diff = (day === 0 ? -6 : 1) - day; 
      x.setDate(x.getDate() + diff);
      return x;
    }

    const weekStart = startOfWeekMonday(new Date());
    const dedupeKey = `summary:week:${weekStart.toISOString().slice(0, 10)}`;

    const notifsRef = collection(db, "users", user.uid, "notifications");
    const existing = await getDocs(
      query(notifsRef, where("dedupeKey", "==", dedupeKey), limit(1))
    );

    if (!existing.empty) return;

    await addDoc(notifsRef, {
      type: "summary",
      channel: "in_app",
      title: "Weekly spending summary",
      body: `You spent €${totalAmount.toFixed(2)} in the last 7 days.`,
      dedupeKey,
      createdAt: serverTimestamp(),
      read: false,
      status: "active",
      meta: { totalAmount },
    });
  };

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
        createWeeklySummaryIfMissing(totalAmount);
      });

      return () => unsubscribe();
    }, [user])
  );

  return (
     <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [{ scale }],
      }}
    >
    <SafeAreaView style={styles.container}>
        <View style={styles.titleRow}>
          <Ionicons name="checkmark-done-outline" size={24} color="green" />
          <Text style={styles.title}>Expenses History</Text>
        </View>
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
    </Animated.View>
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
    color: "#333"
  },
  contentContainer: { 
    flex: 1
   },
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
    justifyContent: "space-between" 
  },
  titleRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 20,
},
});
