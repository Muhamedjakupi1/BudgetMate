// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  GoogleAuthProvider,
  getReactNativePersistence // Important for React Native persistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGq-YDuolUWFI_FFPBvwvRvwnPLjeFGII",
  authDomain: "budgetmate-1b9b3.firebaseapp.com",
  projectId: "budgetmate-1b9b3",
  storageBucket: "budgetmate-1b9b3.firebasestorage.app",
  messagingSenderId: "1990732227",
  appId: "1:1990732227:web:08b5842efecf1d6731f576",
  measurementId: "G-DRG1Z04DN6"
};

// 1. Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// 2. Initialize Auth with React Native Persistence
// Note: In React Native, you often need to use initializeAuth 
// with getReactNativePersistence to prevent "memory persistence" 
// (which would log the user out on app close).
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// 3. Initialize Firestore
const db = getFirestore(app);

// 4. Initialize the Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// 5. Export services and the app instance
export { auth, db, googleProvider };
export default app;