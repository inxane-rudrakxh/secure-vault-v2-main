import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { sendIntruderPushAlert } from "@/hooks/usePushNotifications";

interface IntruderLog {
  id: string;
  email: string;
  timestamp: Date;
  ip: string;
  userAgent: string;
  reason: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  intruderLogs: IntruderLog[];
  failedAttempts: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseUser(firebaseUser: FirebaseUser, createdAt?: Date): AuthUser {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || "SecureVault User",
    email: firebaseUser.email || "",
    createdAt: createdAt || new Date(),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [intruderLogs, setIntruderLogs] = useState<IntruderLog[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const fetchIntruderLogs = async (email: string) => {
    try {
      const logsQuery = query(
        collection(db, "intruder_logs"),
        where("email", "==", email),
        
      );

      const logsSnapshot = await getDocs(logsQuery);
      const logs: IntruderLog[] = logsSnapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          email: data.email || "",
          timestamp: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          ip: data.ipAddress || "Unknown",
          userAgent: data.userAgent || "Unknown",
          reason: data.reason || "Unknown",
        };
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 50);

      setIntruderLogs(logs);
    } catch (error) {
      console.error("Error fetching intruder logs:", error);
      setIntruderLogs([]);
    }
  };

  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    const profileRef = doc(db, "users", firebaseUser.uid);
    const profileSnapshot = await getDoc(profileRef);

    if (!profileSnapshot.exists()) {
      const now = new Date();
      await setDoc(
        profileRef,
        {
          name: firebaseUser.displayName || "SecureVault User",
          email: firebaseUser.email || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return mapFirebaseUser(firebaseUser, now);
    }

    const profileData = profileSnapshot.data();
    return {
      id: firebaseUser.uid,
      name: profileData.name || firebaseUser.displayName || "SecureVault User",
      email: firebaseUser.email || "",
      createdAt:
        profileData.createdAt instanceof Timestamp
          ? profileData.createdAt.toDate()
          : new Date(),
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIntruderLogs([]);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await fetchUserProfile(firebaseUser);
        setUser(profile);
        if (firebaseUser.email) {
          await fetchIntruderLogs(firebaseUser.email);
        }
      } catch (error) {
        console.error("Auth state hydration failed:", error);
        setUser(mapFirebaseUser(firebaseUser));
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logIntruderAttempt = async (email: string, reason: string) => {
    try {
      await addDoc(collection(db, "intruder_logs"), {
        email,
        reason,
        userAgent: navigator.userAgent,
        ipAddress: null,
        createdAt: serverTimestamp(),
      });

      setFailedAttempts((prev) => prev + 1);
      sendIntruderPushAlert(email, `Failed login attempt: ${reason}`);

      if (user?.email === email) {
        await fetchIntruderLogs(email);
      }
    } catch (error) {
      console.error("Error logging intruder attempt:", error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setFailedAttempts(0);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid credentials";
      await logIntruderAttempt(email, errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          name,
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem("securevault_pin_verified");
      sessionStorage.removeItem("securevault_applock_unlocked");
      sessionStorage.removeItem("securevault_2fa_verified");

      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        intruderLogs,
        failedAttempts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
