import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { router } from 'expo-router';

const Profile = () => {
    const user = {
        name: "Besa Gashi",
        email: "BesaGashi@example.com",
        profilePic: require('../../assets/images/favicon.png'),
        totalBudget: 500,
        totalSpent: 275,
        totalDoneExpenses: 5,
    };
    const handleLogout = () => {
  router.replace(".././(auth)"); // navigates to auth/index and removes history
};

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.sContainer}>
            <View style={styles.profileHeader}>
                <Image source={user.profilePic} style={styles.profileImage}></Image>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>${user.totalBudget}</Text>
                    <Text style={styles.statLabel}>Budget</Text></View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>${user.totalBudget}</Text>
                    <Text style={styles.statLabel}>Spent</Text></View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{user.totalDoneExpenses}</Text>
                    <Text style={styles.statLabel}>Done</Text></View>
            </View>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
            <TouchableOpacity style={[styles.button,{backgroundColor: '#FF3B30'}]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
        </View>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
    sContainer: {
    padding: 20,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 16,
    color: '#777',
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
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
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
    fontSize: 16,
  },
  buttonHome: {
    width: '20%',
    height: '12%',
    backgroundColor: '#42e36fff',
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center'
  }
})