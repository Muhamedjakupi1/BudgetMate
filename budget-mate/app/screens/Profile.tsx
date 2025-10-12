import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'

const Profile = () => {
    const user = {
        name: "Besa Gashi",
        email: "BesaGashi@example.com",
        profilePic: require('../../assets/images/favicon.png'),
        totalBudget: 500,
        totalSpent: 275,
        totalDoneExpenses: 5,
    };
  return (
    <SafeAreaView style={styles.container}>
        <View><Text>Home Page</Text></View>
        <ScrollView>
            <View>
                <Image source={user.profilePic}></Image>
                    <Text>{user.name}</Text>
                    <Text>{user.email}</Text>
            </View>
            <View>
                <View><Text>Budget</Text></View>
                <View><Text>Spend</Text></View>
                <View><Text>Done</Text></View>
            </View>

            <TouchableOpacity><Text>Edit Profile</Text></TouchableOpacity>
            <TouchableOpacity><Text>Logout</Text></TouchableOpacity>

        </ScrollView>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7'
    },
})