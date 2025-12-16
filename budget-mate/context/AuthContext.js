import { onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { router } from 'expo-router';
import { doc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubUserDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
            if (unsubUserDoc) {
                unsubUserDoc();
                unsubUserDoc = null;
            }

            if (!fbUser) {
                setUser(null);
                setLoading(false);
                router.replace("/(auth)/signin");
                return;
            }

            const userRef = doc(db, "users", fbUser.uid);

            unsubUserDoc = onSnapshot(
                userRef,
                (snap) => {
                    const updatedUser = snap.exists() ? snap.data() : {};

                    setUser({
                        uid: fbUser.uid,
                        email: fbUser.email,
                        displayName:
                            updatedUser.displayName || fbUser.displayName || "",
                        image: updatedUser.image || null,
                        ...updatedUser,
                    });

                    setLoading(false);
                },
                (err) => {
                    console.error("User doc listener error:", err);

                    setUser({
                        uid: fbUser.uid,
                        email: fbUser.email,
                        displayName: fbUser.displayName || "",
                        image: null,
                    });

                    setLoading(false);
                }
            );
        });

        return () => {
            if (unsubUserDoc) unsubUserDoc();
            unsubscribeAuth();
        };
    }, []);


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