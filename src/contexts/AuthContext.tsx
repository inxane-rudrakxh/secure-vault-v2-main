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
import { toast } from "@/hooks/use-toast";
import { IntruderService, IntruderLogEvent } from "@/services/intruderService";
import { AlertTriangle } from "lucide-react";



interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  cameraConsent?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  intruderLogs: IntruderLogEvent[];
  failedAttempts: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

  function mapFirebaseUser(firebaseUser: FirebaseUser, createdAt?: Date): AuthUser {
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "SecureVault User",
      email: firebaseUser.email || "",
      createdAt: createdAt || new Date(),
      cameraConsent: undefined,
    };
  }

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [intruderLogs, setIntruderLogs] = useState<IntruderLogEvent[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // fetchIntruderLogs is replaced by real-time subscription in useEffect

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

    const profileData = profileSnapshot.data() || {};
    return {
      id: firebaseUser.uid,
      name: profileData.name || firebaseUser.displayName || "SecureVault User",
      email: firebaseUser.email || "",
      createdAt:
        profileData.createdAt instanceof Timestamp
          ? profileData.createdAt.toDate()
          : new Date(),
      cameraConsent: profileData.cameraConsent,
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
      } catch (error) {
        console.error("Auth state hydration failed:", error);
        setUser(mapFirebaseUser(firebaseUser));
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to intruder logs
    const unsubscribe = IntruderService.subscribeToLogs(
      user.id,
      (logs) => {
        setIntruderLogs(logs);
      },
      (newLog) => {
        // Trigger UI alert when a new event comes in
        toast({
          title: "⚠ Security Alert",
          description: `Suspicious activity detected on your account at ${newLog.timestamp.toLocaleTimeString()}`,
          variant: "destructive",
        });
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Log intruder attempt is now handled by IntruderService directly.
  // We no longer log unauthenticated login failures to Firestore.

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      // We do not log to intruder_logs here because the user is unauthenticated
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
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Registration failed" };
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
