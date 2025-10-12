import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import HomePage from "../screens/HomePage";
import ExpensesHistoryPage from "../screens/ExpensesHistoryPage";
import ProfilePage from "../screens/Profile";

const Stack = createNativeStackNavigator();

export default function Tabs() {
  return (
  
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="ExpensesHistory" component={ExpensesHistoryPage} />
      <Stack.Screen name="Profile" component={ProfilePage} />
    </Stack.Navigator>
   
  );
}