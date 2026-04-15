import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/integrations/firebase/client";

export interface IntruderLogEvent {
  id?: string;
  type: "login_failed" | "pin_failed";
  timestamp: Date;
  deviceInfo: string;
  attemptCount: number;
  imageUrl?: string;
  reason: string;
}

export class IntruderService {
  /**
   * Uploads an image captured from the camera to Firebase Storage.
   */
  static async uploadIntruderImage(userId: string, base64DataUrl: string): Promise<string | null> {
    try {
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `intruder-captures/${userId}/${timestamp}.jpg`);
      
      // Upload the base64 string
      const snapshot = await uploadString(storageRef, base64DataUrl, "data_url");
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (error) {
      console.error("Failed to upload intruder image:", error);
      return null;
    }
  }

  /**
   * Logs an intruder event to Firestore under the user's specific subcollection.
   */
  static async logIntruderEvent(
    userId: string,
    type: "login_failed" | "pin_failed",
    attemptCount: number,
    reason: string,
    imageUrl?: string | null
  ): Promise<void> {
    try {
      const logsRef = collection(db, "users", userId, "intruderLogs");
      
      await addDoc(logsRef, {
        type,
        timestamp: serverTimestamp(),
        deviceInfo: navigator.userAgent,
        attemptCount,
        reason,
        ...(imageUrl && { imageUrl }),
      });
    } catch (error) {
      console.error("Failed to log intruder event:", error);
    }
  }

  /**
   * Listens for real-time changes to the intruder logs for a specific user.
   */
  static subscribeToLogs(
    userId: string,
    onLogsUpdate: (logs: IntruderLogEvent[]) => void,
    onNewAlert: (log: IntruderLogEvent) => void
  ) {
    const logsRef = collection(db, "users", userId, "intruderLogs");
    const logsQuery = query(logsRef, orderBy("timestamp", "desc"), limit(50));

    let isInitialLoad = true;

    return onSnapshot(logsQuery, (snapshot) => {
      const logs: IntruderLogEvent[] = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && !isInitialLoad) {
          const data = change.doc.data();
          onNewAlert({
            id: change.doc.id,
            type: data.type as "login_failed" | "pin_failed",
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
            deviceInfo: data.deviceInfo || "Unknown",
            attemptCount: data.attemptCount || 1,
            reason: data.reason || "Unknown",
            imageUrl: data.imageUrl,
          });
        }
      });

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          type: data.type as "login_failed" | "pin_failed",
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
          deviceInfo: data.deviceInfo || "Unknown",
          attemptCount: data.attemptCount || 1,
          reason: data.reason || "Unknown",
          imageUrl: data.imageUrl,
        });
      });

      isInitialLoad = false;
      onLogsUpdate(logs);
    }, (error) => {
      console.error("Intruder Logs Subscription Error:", error);
    });
  }
}
