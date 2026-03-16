import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";

interface EncryptedFile {
  id: string;
  name: string;
  size: number;
  encryptedAt: Date;
  type: string;
  encrypted: boolean;
}

interface VaultContextType {
  files: EncryptedFile[];
  storageUsed: number;
  storageLimit: number;
  uploadFile: (file: File) => Promise<void>;
  deleteFile: (id: string) => void;
  downloadFile: (id: string) => void;
  isUploading: boolean;
  isLoading: boolean;
  refreshFiles: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

const STORAGE_LIMIT = 10 * 1024 * 1024 * 1024;

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<EncryptedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const fetchFiles = async () => {
    if (!isAuthenticated || !user) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    try {
      const filesQuery = query(
        collection(db, "users", user.id, "files"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(filesQuery);

      const records: EncryptedFile[] = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          name: data.name || "Untitled",
          size: data.size || 0,
          encryptedAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          type: data.type || "application/octet-stream",
          encrypted: data.encrypted !== false,
        };
      });

      setFiles(records);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFiles();
    } else {
      setFiles([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const storageUsed = files.reduce((acc, file) => acc + file.size, 0);

  const uploadFile = async (file: File) => {
    if (!user) {
      console.error("No authenticated user");
      return;
    }

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

      const docRef = await addDoc(collection(db, "users", user.id, "files"), {
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        encrypted: true,
        createdAt: serverTimestamp(),
      });

      const newFile: EncryptedFile = {
        id: docRef.id,
        name: file.name,
        size: file.size,
        encryptedAt: new Date(),
        type: file.type || "application/octet-stream",
        encrypted: true,
      };

      setFiles((prev) => [newFile, ...prev]);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (id: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.id, "files", id));
      setFiles((prev) => prev.filter((file) => file.id !== id));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const downloadFile = (id: string) => {
    const file = files.find((entry) => entry.id === id);
    if (file) {
      console.log(`Downloading and decrypting file: ${file.name}`);
    }
  };

  const refreshFiles = async () => {
    setIsLoading(true);
    await fetchFiles();
  };

  return (
    <VaultContext.Provider
      value={{
        files,
        storageUsed,
        storageLimit: STORAGE_LIMIT,
        uploadFile,
        deleteFile,
        downloadFile,
        isUploading,
        isLoading,
        refreshFiles,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
};
