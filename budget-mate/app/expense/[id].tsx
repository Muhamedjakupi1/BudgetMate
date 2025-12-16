import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, ScrollView, Button, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import StatusModal from "../../components/ui/statusModal";
import DateTimePicker from '@react-native-community/datetimepicker';


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
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDuePicker, setShowDuePicker] = useState(false);

    

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
                    setDueDate(data.dueDate ? data.dueDate.toDate() : null);
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
            dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
            updatedAt: new Date(),
        };

        try {
            const transactionRef = doc(db, "users", user.uid, "transactions", id as string);
            await updateDoc(transactionRef, updatedData);

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
        <SafeAreaView style={styles.safeArea}>
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

                    <Text style={styles.label}>Due date</Text>

                    {Platform.OS === 'web' ? (
                        <View style={styles.webDateWrapper}>
                            <input
                                type="date"
                                value={dueDate ? dueDate.toISOString().slice(0, 10) : ''}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (!v) return setDueDate(null);
                                    const [y, m, d] = v.split('-').map(Number);
                                    setDueDate(new Date(y, m - 1, d));
                                }}
                                style={styles.webDateInput as any}
                            />
                            
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.dropdown} onPress={() => setShowDuePicker(true)}>
                                <Text style={{ color: dueDate ? '#000' : '#888', fontWeight: '600' }}>
                                    {dueDate ? dueDate.toDateString() : 'Select due date'}
                                </Text>
                            </TouchableOpacity>

                            {showDuePicker && (
                                <View style={styles.iosPickerContainer}>
                                <DateTimePicker
                                    value={dueDate ?? new Date()}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, selectedDate) => {
                                        setShowDuePicker(false);
                                        if ((event as any)?.type === 'dismissed') return;
                                        if (selectedDate) setDueDate(selectedDate);
                                    }}
                                />
                                </View>
                            )}
                        </>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
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

    },
    webDateWrapper: { position: 'relative', width: '100%' },
    webDateIconRight: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -10 }],
    },
    webDateInput: {
        width: '100%',
        height: 48,
        paddingLeft: 14,
        paddingRight: 42,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: 16,
        backgroundColor: '#fff',
        // @ts-ignore
        boxSizing: 'border-box',
        // @ts-ignore
        appearance: 'none',
        // @ts-ignore
        WebkitAppearance: 'none',
    },
    iosPickerContainer: {
        marginTop: 8,
        backgroundColor: '#888',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: '#ddd',
    },


});

