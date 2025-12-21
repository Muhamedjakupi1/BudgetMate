import { useEffect, useState, memo, useCallback } from "react";
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, getDoc, addDoc, serverTimestamp, Timestamp, getDocs, where, limit, } from "firebase/firestore";
import { db } from "../../firebase";
import ConfirmModal from '../../components/ui/modalWithButtons';
import { Transaction, generateRandomTransactions } from "../../components/fakeTransaction";
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from "expo-notifications";
import useTabAnimation from "../hooks/tabAnimation";
import { Animated } from "react-native";
import CountUpNumber from "../../components/ui/countUpNum";

type NotifType = "bill_reminder" | "summary" | "low_budget" | "unusual_spending";
type NotifChannel = "push" | "in_app";

const ExpenseItem = memo(({ item, onDelete, onDone, onEdit }: any) => {
  console.log("Rendering item:", item.id);
  return (
    <View style={styles.expenseItem}>
      <View>
        <Text style={styles.expenseTitle}>
          {item.category} {item.isExternalApi ? "(FAKE)" : ""}
        </Text>
        <Text style={styles.expenseAmount}>€{item.amount}</Text>
        {item.note && <Text style={styles.expenseNote}>{item.note}</Text>}
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#d41309ff" }]}
          onPress={() => onDelete(item)}
        >
          <Text style={{ color: "white", fontWeight: "500" }}>Delete</Text>
        </TouchableOpacity>

        {!item.isExternalApi && (
          <>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#518e59ff" }]}
              onPress={() => onDone(item)}
            >
              <Text style={{ color: "white", fontWeight: "500" }}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#34aac7" }]}
              onPress={() => onEdit(item)}
            >
              <Text style={{ color: "white", fontWeight: "500" }}>Edit</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
});

async function createNotificationIfNotExists(params: {
  uid: string;
  type: NotifType;
  channel: NotifChannel;
  title: string;
  body: string;
  dedupeKey: string;
  scheduledAt?: Date;
  expoNotificationId?: string;
  meta?: Record<string, any>;
}) {
  const { uid, type, channel, title, body, dedupeKey, scheduledAt, expoNotificationId, meta } =
    params;

  const notifRef = collection(db, "users", uid, "notifications");

  const existing = await getDocs(query(notifRef, where("dedupeKey", "==", dedupeKey), limit(1)));
  if (!existing.empty) return;

  await addDoc(notifRef, {
    type,
    channel,
    title,
    body,
    dedupeKey,
    createdAt: serverTimestamp(),
    read: false,
    status: "active",
    ...(scheduledAt ? { scheduledAt: Timestamp.fromDate(scheduledAt) } : {}),
    ...(expoNotificationId ? { expoNotificationId } : {}),
    ...(meta ? { meta } : {}),
  });
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function weekKey(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo}`;
}

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
  const { opacity, scale } = useTabAnimation();
  
  useEffect(() => {
  if (!user?.uid) return;

  const q = query(collection(db, "users", user.uid, "transactions"));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const trans: Transaction[] = [];
    let totalBalance = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;

      const txn: Transaction = {
        id: docSnap.id,
        type: data.type,
        amount: Number(data.amount) || 0,
        category: data.category ?? null,
        done: !!data.done,
        note: data.note ?? "",
        paymentType: data.paymentType ?? "",
        payeeName: data.payeeName ?? "",
        date: data.date?.toDate?.() ?? null,
        dueDate: data.dueDate?.toDate?.() ?? null,
        isExternalApi: false,
      };

      trans.push(txn);

      if (txn.type === "income") totalBalance += txn.amount;
      if (txn.type === "expense" && txn.done) totalBalance -= txn.amount;
    });

    setFirebaseTransactions(trans);
    setBalance(totalBalance);

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const dueSoon = trans.filter(
      (t): t is Transaction & { dueDate: Date } =>
        t.type === "expense" &&
        !t.done &&
        t.dueDate instanceof Date &&
        t.dueDate.getTime() <= in24h.getTime()
    );

    if (dueSoon.length > 0) {
      const soonest = dueSoon
        .slice()
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

      const dueDate = soonest.dueDate;

      const dueDateWithTime = new Date(dueDate);
      dueDateWithTime.setHours(12, 0, 0, 0);
      const twoHoursBefore = new Date(dueDateWithTime.getTime() - 2 * 60 * 60 * 1000);

      const scheduledAt =
        twoHoursBefore.getTime() > now.getTime()
          ? twoHoursBefore
          : new Date(now.getTime()+ 5 * 1000);

      const dedupeKey = `bill_reminder:${soonest.id}:${dueDateWithTime.toISOString()}`;

      const existsSnap = await getDocs(
        query(
          collection(db, "users", user.uid, "notifications"),
          where("dedupeKey", "==", dedupeKey),
          limit(1)
        )
      );

      if (existsSnap.empty) {
        let expoId: string | undefined;

        try {
          const perm = await Notifications.getPermissionsAsync();
          if (!perm.granted) {
            const req = await Notifications.requestPermissionsAsync();
            if (!req.granted) throw new Error("Notification permission not granted");
          }

          const seconds = Math.max(
            5,
            Math.floor((scheduledAt.getTime() - Date.now()) / 1000)
          );

          expoId = await Notifications.scheduleNotificationAsync({
            content: {
              title: "Bill reminder",
              body: `You have ${dueSoon.length} bill(s) due soon.`,
              sound: true,
            },
            trigger: { seconds, repeats: false } as any,
          });
        } catch {}

        await addDoc(collection(db, "users", user.uid, "notifications"), {
          type: "bill_reminder",
          channel: expoId ? "push" : "in_app",
          title: "Bill reminder",
          body: `You have ${dueSoon.length} bill(s) due soon.`,
          dedupeKey,
          createdAt: serverTimestamp(),
          scheduledAt: Timestamp.fromDate(scheduledAt),
          expoNotificationId: expoId ?? null,
          read: false,
          status: "active",
          meta: { count: dueSoon.length, soonestDue: dueDate.toISOString() },
        });
      }
    }
  });

  return () => unsubscribe();
}, [user?.uid]);

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

        setStatusMessage("Not enough budget to complete this expense!");
        setStatusModalVisible(true);

        return;
      }

      await updateDoc(transactionRef, { done: true });

      const newOverallBudget = currentOverallBudget - txn.amount;
      await updateDoc(userRef, { overallBudget: newOverallBudget });

      const LOW_THRESHOLD = 10;
      if (newOverallBudget <= LOW_THRESHOLD) {
        await createNotificationIfNotExists({
          uid: user.uid,
          type: "low_budget",
          channel: "in_app",
          title: "Low budget warning",
          body: `Your remaining budget is €${newOverallBudget.toFixed(2)}.`,
          dedupeKey: `low_budget:${startOfDay(new Date()).toISOString()}:${LOW_THRESHOLD}`,
          meta: { remaining: newOverallBudget, threshold: LOW_THRESHOLD },
        });
      }

    } catch (err) {
      console.error(err);
    }
  };


  const handleEditPress = useCallback((txn: Transaction) => {
    if (!txn.isExternalApi) router.push(`/expense/${txn.id}`);
  }, []);

  const handleDeletePress = useCallback((txn: Transaction) => {
    setSelectedTransaction(txn);
    setModalAction('delete');
    setModalVisible(true);
  }, []);

  const handleDonePress = useCallback((txn: Transaction) => {
    if (txn.isExternalApi) return;
    setSelectedTransaction(txn);
    setModalAction("done");
    setModalVisible(true);
  }, []);

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

  const renderExpense = useCallback(({ item }: { item: Transaction }) => (
    <ExpenseItem
      item={item}
      onDelete={handleDeletePress}
      onDone={handleDonePress}
      onEdit={handleEditPress}
    />
  ), [handleDeletePress, handleDonePress, handleEditPress]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [{ scale }],
      }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View style={styles.header}>
          <Ionicons name="cash" size={24} color="green" />
          <View style={{ width: 8 }} />
          <Text style={styles.budgetText}>Budget: </Text>
          <CountUpNumber value={balance} prefix="€" decimals={2} style={styles.budgetText} />
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
    </Animated.View>
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
