import { onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { router } from 'expo-router';
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const data = await getDoc(userRef);
                const updatedUser = data.exists() ? data.data() : {};

                setUser({
                    uid: user.uid,
                    email: user.email,
                    displayName: updatedUser.displayName || user.displayName || '',
                    image: updatedUser.image || null,
                    ...updatedUser,
                });

                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
                router.replace('/(auth)/signin');
            }
        });
        return () => unsubscribe();
    }, [])

    const logout = async () => {
        try {
            await signOut(auth);
            router.replace('/(auth)/signin');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    }

    return (
        <AuthContext.Provider value={{ user, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);