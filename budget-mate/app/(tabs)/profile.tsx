import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import ConfirmModal from '../../components/ui/ConfirmModal'
import { doc, updateDoc } from 'firebase/firestore'

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  done: boolean;
};

const Profile = () => {
  const { user: currentUser, logout, loading, setUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const userName = currentUser?.displayName || 'No Name';
  const userEmail = currentUser?.email || 'No Email';
  const [modalType, setModalType] = useState("");
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const showModal = (type: string, message: string) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showModal('error', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpg;base64,${result.assets[0].base64}`;
      const userRef = doc(db, "users", currentUser.uid);

      try {
        await updateDoc(userRef, { image: base64Img });
        setUser((prev: any) => {
          if (!prev) return prev;
          return { ...prev, image: base64Img };
        });
        showModal("success", "Profile image updated successfully!");
      } catch {
        showModal("error", "Image cannot be updated. Please try again!");
      }
    }
  };


  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      showModal("error", "Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpg;base64,${result.assets[0].base64}`;
      const userRef = doc(db, "users", currentUser.uid);

      try {
        await updateDoc(userRef, { image: base64Img });
        setUser((prev: any) => {
          if (!prev) return prev;
          return { ...prev, image: base64Img };
        });
        showModal("success", "Photo uploaded successfully!");
      } catch {
        showModal("error", "Image cannot be uploaded. Please try again!");
      }
    }
  };

  const removePhoto = async () => {
    const userRef = doc(db, "users", currentUser.uid);

    try {
      await updateDoc(userRef, { image: null });

      setUser((prev: any) => {
        if (!prev) return prev;
        return { ...prev, image: null };
      });

      showModal("success", "Profile photo removed!");
    } catch {
      showModal("error", "Could not remove photo. Please try again!");
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  }

  if (loading || !currentUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.welcome}>Loading user info...</Text>
      </View>
    )
  }

  useEffect(() => {
    if (!currentUser) return;

    const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
    const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || 0,
          done: data.done || false,
        };
      });
      setTransactions(docs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.done)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const totalDoneExpenses = transactions.filter((t) => t.type === 'expense' && t.done).length;

  const handleLogout = async () => {
    await logout();
    router.replace('.././(auth)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.sContainer}>
        <View style={styles.profileHeader}>
          {currentUser.image ? (
            <Image style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 20 }} source={{ uri: currentUser.image }} />
          ) : (
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
              <Text>No image</Text>
            </View>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.smallButton} onPress={pickImage}>
              <Text style={styles.buttonText}>Pick Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.smallButton, { backgroundColor: "#555" }]} onPress={takePhoto}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.smallButton, { backgroundColor: "#d11" }]} onPress={removePhoto}>
              <Text style={styles.buttonText}>Remove Image</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>€{balance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Budget</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalExpense.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalDoneExpenses}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#d41309ff' }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7'
  },
  sContainer: {
    padding: 20,
    alignItems: 'center'
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  userEmail: {
    fontSize: 18,
    color: '#777'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 14,
    color: '#777'
  },
  button: {
    width: '100%',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  welcome: {
    fontSize: 16,
    marginTop: 10,
    color: '#333'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  smallButton: {
    flex: 1,
    backgroundColor: '#03A9F4',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },

});
