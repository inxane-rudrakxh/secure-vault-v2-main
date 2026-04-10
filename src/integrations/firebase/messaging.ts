import { getMessaging, getToken, isSupported, onMessage, MessagePayload } from "firebase/messaging";
import { app, firebaseConfig } from "@/integrations/firebase/client";

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

export async function messagingSupported(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    return false;
  }
  return isSupported();
}

export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    await navigator.serviceWorker.ready;

    registration.active?.postMessage({
      type: "INIT_FIREBASE",
      config: firebaseConfig,
    });

    return registration;
  } catch (error) {
    console.error("Failed to register firebase messaging service worker:", error);
    return null;
  }
}

export async function getFcmToken(
  registration: ServiceWorkerRegistration
): Promise<string | null> {
  try {
    if (!vapidKey) {
      console.warn("Missing VITE_FIREBASE_VAPID_KEY. FCM token cannot be generated.");
      return null;
    }

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
}

export function onForegroundFcmMessage(handler: (payload: MessagePayload) => void): () => void {
  const messaging = getMessaging(app);
  return onMessage(messaging, handler);
}
