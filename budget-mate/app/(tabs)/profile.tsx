// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase';
import { onSnapshot, collection, doc, updateDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import ConfirmModal from '../../components/ui/ConfirmModal';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  done: boolean;
};

const Profile = () => {
  const { user: currentUser, logout, loading: authLoading, setUser } = useAuth();

  // Loading & auth guard
  if (authLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!currentUser) {
    useEffect(() => {
      router.replace('/(auth)');
    }, []);
    return null;
  }

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Modal states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'removePhoto' | 'logout' | null>(null);

  const userName = currentUser.displayName || 'No Name';
  const userEmail = currentUser.email || 'No Email';
  const userPhoto = currentUser.image || null;

  // Toast helper
  const showToast = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  // Confirm helper
  const openConfirm = (action: 'removePhoto' | 'logout') => {
    setConfirmAction(action);
    setConfirmVisible(true);
  };

  // Fetch transactions
  useEffect(() => {
    const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
    const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          type: data.type as 'income' | 'expense',
          amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || 0,
          done: !!data.done,
        };
      });
      setTransactions(docs);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  // Image Picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('error', 'Need permission to access photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await uploadImage(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast('error', 'Need camera permission!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await uploadImage(result.assets[0].base64);
    }
  };

  const uploadImage = async (base64: string) => {
    const base64Img = `data:image/jpeg;base64,${base64}`;
    const userRef = doc(db, 'users', currentUser.uid);

    try {
      await updateDoc(userRef, { image: base64Img });
      setUser((prev: any) => ({ ...prev, image: base64Img }));
      showToast('success', 'Profile picture updated!');
    } catch (err) {
      showToast('error', 'Failed to upload image');
    }
  };

  const handleRemovePhoto = async () => {
    if (!userPhoto) {
      showToast('error', 'No profile picture to remove!');
      return;
    }

    openConfirm('removePhoto');
  };

  const confirmRemovePhoto = async () => {
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, { image: null });
      setUser((prev: any) => ({ ...prev, image: null }));
      showToast('success', 'Profile picture removed');
    } catch {
      showToast('error', 'Failed to remove photo');
    }
    setConfirmVisible(false);
  };

  const handleLogout = () => {
    openConfirm('logout');
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    router.replace('/(auth)');
    try {
      await logout();
    } catch (err) {
      console.warn('Logout failed (already navigated)');
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.done)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const doneExpensesCount = transactions.filter((t) => t.type === 'expense' && t.done).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7f7" />

      <View style={styles.sContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {userPhoto ? (
            <Image style={styles.profileImage} source={{ uri: userPhoto }} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.smallButton} onPress={pickImage}>
              <Text style={styles.btnText}>Pick Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#444' }]} onPress={takePhoto}>
              <Text style={styles.btnText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallButton, { backgroundColor: userPhoto ? '#d11a2a' : '#999' }]}
              onPress={handleRemovePhoto}
              disabled={!userPhoto}
            >
              <Text style={styles.btnText}>Remove</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>€{balance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>€{totalExpense.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{doneExpensesCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { opacity: isLoggingOut ? 0.6 : 1 }]}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toast Modal */}
      <ConfirmModal
        visible={toastVisible}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />

      {/* Confirm Modal (Remove Photo or Logout) */}
      <ConfirmModal
        visible={confirmVisible}
        type="error"
        message={
          confirmAction === 'removePhoto'
            ? 'Are you sure you want to remove your profile picture?'
            : 'Are you sure you want to log out?'
        }
        onClose={() => setConfirmVisible(false)}
        showConfirm={true}
        onConfirm={() => {
          if (confirmAction === 'removePhoto') {
            confirmRemovePhoto();
          } else if (confirmAction === 'logout') {
            confirmLogout();
          }
        }}
      />
    </SafeAreaView>
  );
};

export default Profile;

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  sContainer: { flex: 1, padding: 20, alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: '#666' },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: { color: '#888', fontSize: 14 },
  buttonRow: { flexDirection: 'row', width: '100%', marginBottom: 20 },
  smallButton: {
    flex: 1,
    backgroundColor: '#0066ff',
    paddingVertical: 11,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  userEmail: { fontSize: 16, color: '#666', marginTop: 5 },
  statsContainer: { flexDirection: 'row', width: '100%', marginBottom: 40 },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  statLabel: { fontSize: 13, color: '#777', marginTop: 5 },
  logoutBtn: {
    width: '100%',
    backgroundColor: '#d41309',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});