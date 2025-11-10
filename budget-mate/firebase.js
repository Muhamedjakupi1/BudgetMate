// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGq-YDuolUWFI_FFPBvwvRvwnPLjeFGII",
  authDomain: "budgetmate-1b9b3.firebaseapp.com",
  projectId: "budgetmate-1b9b3",
  storageBucket: "budgetmate-1b9b3.firebasestorage.app",
  messagingSenderId: "1990732227",
  appId: "1:1990732227:web:08b5842efecf1d6731f576",
  measurementId: "G-DRG1Z04DN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export default app;