import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "securevault-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((value) => value.toString(16).padStart(2, "0")).join("");
};

export const useEncryptionPin = () => {
  const { user, isAuthenticated } = useAuth();
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPinRef = useCallback(() => {
    if (!user?.id) return null;
    return doc(db, "users", user.id, "security", "encryptionPin");
  }, [user?.id]);

  const checkPinExists = useCallback(async () => {
    const pinRef = getPinRef();
    if (!pinRef) {
      setHasPin(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const snapshot = await getDoc(pinRef);
      setHasPin(snapshot.exists());
    } catch (err) {
      console.error("Error checking PIN:", err);
      setError("Failed to check encryption PIN status");
      setHasPin(false);
    } finally {
      setIsLoading(false);
    }
  }, [getPinRef]);

  useEffect(() => {
    if (isAuthenticated) {
      checkPinExists();
    } else {
      setHasPin(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, checkPinExists]);

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
    } catch (err) {
      console.error("Error creating PIN:", err);
      setError("Failed to create encryption PIN");
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
    } catch (err) {
      console.error("Error verifying PIN:", err);
      return false;
    }
  };

  const updatePin = async (
    currentPin: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> => {
    const pinRef = getPinRef();
    if (!pinRef) return { success: false, error: "Not authenticated" };

    try {
      const isValid = await verifyPin(currentPin);
      if (!isValid) {
        return { success: false, error: "Current PIN is incorrect" };
      }

      const newPinHash = await hashPin(newPin);
      await updateDoc(pinRef, { pinHash: newPinHash, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (err) {
      console.error("Error updating PIN:", err);
      return { success: false, error: "Failed to update PIN" };
    }
  };

  return {
    hasPin,
    isLoading,
    error,
    createPin,
    verifyPin,
    updatePin,
    refreshPinStatus: checkPinExists,
  };
};
