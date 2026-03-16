import { useState, useEffect, useCallback } from "react";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function useAppLockPin() {
  const { user } = useAuth();
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPinRef = useCallback(() => {
    if (!user?.id) return null;
    return doc(db, "users", user.id, "security", "appLockPin");
  }, [user?.id]);

  const checkPinExists = useCallback(async () => {
    const pinRef = getPinRef();
    if (!pinRef) {
      setHasPin(null);
      setIsLoading(false);
      return;
    }

    try {
      const snapshot = await getDoc(pinRef);
      setHasPin(snapshot.exists());
    } catch {
      setHasPin(false);
    } finally {
      setIsLoading(false);
    }
  }, [getPinRef]);

  useEffect(() => {
    checkPinExists();
  }, [checkPinExists]);

  const createPin = async (pin: string): Promise<boolean> => {
    const pinRef = getPinRef();
    if (!pinRef) return false;

    try {
      const pinHash = await hashPin(pin);
      await setDoc(
        pinRef,
        {
          pinHash,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setHasPin(true);
      return true;
    } catch {
      return false;
    }
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const pinRef = getPinRef();
    if (!pinRef) return false;

    try {
      const pinHash = await hashPin(pin);
      const snapshot = await getDoc(pinRef);
      if (!snapshot.exists()) return false;
      const data = snapshot.data();
      return data.pinHash === pinHash;
    } catch {
      return false;
    }
  };

  const updatePin = async (
    currentPin: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> => {
    const pinRef = getPinRef();
    if (!pinRef) return { success: false, error: "Not authenticated" };

    const valid = await verifyPin(currentPin);
    if (!valid) return { success: false, error: "Current PIN is incorrect" };

    try {
      const pinHash = await hashPin(newPin);
      await updateDoc(pinRef, { pinHash, updatedAt: serverTimestamp() });
      return { success: true };
    } catch {
      return { success: false, error: "Unexpected error" };
    }
  };

  const removePin = async (): Promise<boolean> => {
    const pinRef = getPinRef();
    if (!pinRef) return false;

    try {
      await deleteDoc(pinRef);
      setHasPin(false);
      sessionStorage.removeItem("securevault_applock_unlocked");
      return true;
    } catch {
      return false;
    }
  };

  return { hasPin, isLoading, createPin, verifyPin, updatePin, removePin, recheckPin: checkPinExists };
}
