import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/integrations/firebase/client";
import {
  getFcmToken,
  messagingSupported,
  onForegroundFcmMessage,
  registerMessagingServiceWorker,
} from "@/integrations/firebase/messaging";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";

const PREF_KEY = "securevault_push_preference";
const API_URL = import.meta.env.VITE_FIREBASE_NOTIFICATIONS_API_URL as string | undefined;

function tokenId(token: string): string {
  return token.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function postNotificationEvent(path: string, body: Record<string, unknown>) {
  if (!API_URL) return;

  try {
    await fetch(`${API_URL.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("Notification API request failed:", error);
  }
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    messagingSupported().then((supported) => {
      setIsSupported(supported);
      if (supported) {
        setPermission(Notification.permission);
        setIsSubscribed(localStorage.getItem(PREF_KEY) === "granted");
      }
    });
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const unsubscribe = onForegroundFcmMessage((payload) => {
      const title = payload?.notification?.title || "SecureVault Alert";
      const body = payload?.notification?.body || "New security activity detected.";

      if (Notification.permission === "granted") {
        new Notification(title, { body, icon: "/favicon.ico" });
      }
    });

    return () => unsubscribe();
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    if (localStorage.getItem(PREF_KEY) === "denied") return false;

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        localStorage.setItem(PREF_KEY, "denied");
        setIsSubscribed(false);
        return false;
      }

      const registration = await registerMessagingServiceWorker();
      if (!registration) return false;

      const token = await getFcmToken(registration);
      if (!token) return false;

      const currentUser = auth.currentUser;
      if (currentUser) {
        await setDoc(
          doc(db, "users", currentUser.uid, "pushTokens", tokenId(token)),
          {
            token,
            userId: currentUser.uid,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
            userAgent: navigator.userAgent,
          },
          { merge: true }
        );
      }

      await postNotificationEvent("/subscribe", {
        token,
        userId: currentUser?.uid || null,
      });

      setFcmToken(token);
      localStorage.setItem(PREF_KEY, "granted");
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error("Push subscribe error:", error);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    try {
      const token = fcmToken;
      const currentUser = auth.currentUser;

      if (token && currentUser) {
        await deleteDoc(doc(db, "users", currentUser.uid, "pushTokens", tokenId(token)));
      }

      if (token) {
        await postNotificationEvent("/unsubscribe", { token, userId: currentUser?.uid || null });
      }

      localStorage.removeItem(PREF_KEY);
      setFcmToken(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error("Push unsubscribe error:", error);
    }
  }, [fcmToken]);

  return { isSupported, permission, isSubscribed, subscribe, unsubscribe };
}

export async function sendIntruderPushAlert(email: string, reason: string): Promise<void> {
  await postNotificationEvent("/send-intruder-alert", { email, reason });

  if (!API_URL && Notification.permission === "granted") {
    try {
      new Notification("SecureVault Security Alert", {
        body: `${email}: ${reason}`,
        icon: "/favicon.ico",
      });
    } catch (error) {
      console.error("Failed to show fallback intruder alert notification:", error);
    }
  }
}
