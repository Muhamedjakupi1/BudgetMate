import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, ScrollView, Button } from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import StatusModal from "../../components/ui/statusModal";

const FormInput = (props: any) => <TextInput style={styles.input} {...props} />;

const categoryColors: Record<string, string> = {
    Transport: '#E53935',
    'Food and Drink': '#FDD835',
    'Home Bills': '#518e59ff',
    Entertainment: '#1E88E5',
    Shopping: '#8E24AA',
    Health: '#D81B60',
    Other: '#757575',
    Salary: '#FF5722',
    Freelance: '#FFC107',
    Investment: '#4CAF50',
    Gift: '#03A9F4',
};

const expenseCategories = ['Transport', 'Food and Drink', 'Home Bills', 'Entertainment', 'Shopping', 'Health', 'Other'];
const paymentOptions = ['Cash', 'Card'];

export default function TransactionDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [transaction, setTransaction] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newNote, setNewNote] = useState('');
    const [newPaymentType, setNewPaymentType] = useState('');
    const [newPayeeName, setNewPayeeName] = useState('');
    const [isCategoryOpen, setCategoryOpen] = useState(false);
    const [isPaymentOpen, setPaymentOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'success' | 'error'>('success');
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const loadTransaction = async () => {
            if (!user || !id) {
                setLoading(false);
                return;
            }
            try {
                const ref = doc(db, "users", user.uid, "transactions", id as string);
                const getTrans = await getDoc(ref);

                if (getTrans.exists()) {
                    const data = getTrans.data();
                    setTransaction({ id, ...data });
                    setNewAmount(data.amount?.toString() || '');
                    setNewCategory(data.category || '');
                    setNewNote(data.note || '');
                    setNewPaymentType(data.paymentType || '');
                    setNewPayeeName(data.payeeName || '');
                }
            } catch (e) {
                console.error("Error:", e);
            } finally {
                setLoading(false);
            }
        };
        loadTransaction();
    }, [id, user]);

        const handleUpdate = async () => {
        if (!user || !id || !transaction) return;

        const amountValue = parseFloat(newAmount);
        const oldAmountValue = transaction.amount;
        const transactionType = transaction.type;

        if (isNaN(amountValue) || amountValue <= 0) {
            setModalType("error");
            setModalMessage("Amount must be a positive number.");
            setModalVisible(true);
            return;
        }
        if (transactionType === 'expense' && newCategory.trim() === "") {
            setModalType("error");
            setModalMessage("Category must be completed");
            setModalVisible(true);
            return;
        }

        const updatedData = {
            amount: amountValue,
            category: transactionType === 'expense' ? newCategory.trim() : null,
            note: transactionType === 'expense' ? newNote.trim() : null,
            paymentType: transactionType === 'expense' ? newPaymentType : null,
            payeeName: transactionType === 'expense' ? newPayeeName : null,
            updatedAt: new Date(),
        };

        try {
            const transactionRef = doc(db, "users", user.uid, "transactions", id as string);
            const userRef = doc(db, 'users', user.uid);


            await updateDoc(transactionRef, updatedData);

            const amountDifference = amountValue - oldAmountValue;
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                let currentOverallBudget = userData.overallBudget || 0;
                let newOverallBudget = currentOverallBudget;
                if (transactionType === 'expense') {
                    newOverallBudget -= amountDifference;
                } else if (transactionType === 'income') {
                    newOverallBudget += amountDifference;
                }

                await updateDoc(userRef, { overallBudget: newOverallBudget });
            }

            setTransaction((prev: any) => ({ ...prev, ...updatedData }));

            setModalType("success");
            setModalMessage("Transaction updated successfully!");
            setModalVisible(true);
            setTimeout(() => router.back(), 500);

        } catch (error) {
            console.error("Error", error);
            setModalType("error");
            setModalMessage("Transaction failed to update!");
            setModalVisible(true);
        }
    };


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#518e59ff" />
                <Text style={{ marginTop: 10 }}>Loading transaction ...</Text>
            </View>
        );
    }

    if (!transaction) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: 'red' }}>Transaction not found.</Text>
                <Button title="Go back" onPress={() => router.back()} color="#518e59ff" />
            </View>
        );
    }

    const categoryStyle = {
        backgroundColor: categoryColors[newCategory] || '#ccc',
        color: 'white'
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Update Expense</Text>

            <Text style={styles.label}>Amount</Text>
            <FormInput
                value={newAmount}
                onChangeText={setNewAmount}
                keyboardType="numeric"
            />
            <>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                    style={[styles.dropdown, { backgroundColor: newCategory ? categoryColors[newCategory] : '#fff' }]}
                    onPress={() => setCategoryOpen(!isCategoryOpen)}
                >
                    <Text style={{ color: newCategory ? 'white' : '#888', fontWeight: '600' }}>
                        {newCategory || 'Select Category'}
                    </Text>
                </TouchableOpacity>
                {isCategoryOpen && (
                    <View style={styles.dropdownList}>
                        {expenseCategories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.dropdownItem, { backgroundColor: categoryColors[cat] || '#ccc' }]}
                                onPress={() => {
                                    setNewCategory(cat);
                                    setCategoryOpen(false);
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.label}>Payment Type</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => setPaymentOpen(!isPaymentOpen)}>
                    <Text style={{ color: newPaymentType ? '#000' : '#888', fontWeight: '600' }}>
                        {newPaymentType || 'Select Payment Type'}
                    </Text>
                </TouchableOpacity>
                {isPaymentOpen && (
                    <View style={styles.dropdownList}>
                        {paymentOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.dropdownItem, { backgroundColor: '#518e59ff' }]}
                                onPress={() => {
                                    setNewPaymentType(opt);
                                    setPaymentOpen(false);
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: '600' }}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.label}>Note</Text>
                <FormInput value={newNote} onChangeText={setNewNote} />
                <Text style={styles.label}>Payee Name</Text>
                <FormInput value={newPayeeName} onChangeText={setNewPayeeName} />
            </>

             <View style={{ marginTop: 20, marginBottom: 40 }}>
                <Button title="Save Changes" onPress={handleUpdate} color="#518e59ff" />
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.text}>Go back</Text>
                </TouchableOpacity>
            </View>
            <StatusModal
                visible={modalVisible}
                message={modalMessage}
                type={modalType}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    typeLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
        color: '#518e59ff',
    },
    label: {
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
        fontSize: 16,
        color: '#333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: 'white',
    },
    dropdown: {
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center'
    },
    dropdownList: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 12,
        marginVertical: 2,
        borderRadius: 8,
    },
    text: {
        color: '#0000FF',

    }
});

