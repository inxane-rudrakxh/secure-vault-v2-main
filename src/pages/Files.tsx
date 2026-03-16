import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderLock,
  Upload,
  FileIcon,
  Download,
  Trash2,
  Lock,
  Search,
  MoreVertical,
  Shield,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVault } from "@/contexts/VaultContext";
import { useEncryptionPin } from "@/hooks/useEncryptionPin";
import { SetupPinModal } from "@/components/files/SetupPinModal";
import { VerifyPinModal } from "@/components/files/VerifyPinModal";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFileIcon = (type: string): string => {
  if (type.startsWith("image/")) return "🖼️";
  if (type.startsWith("video/")) return "🎬";
  if (type.startsWith("audio/")) return "🎵";
  if (type.includes("pdf")) return "📄";
  if (type.includes("document") || type.includes("word")) return "📝";
  if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
  return "📁";
};

// Session-based PIN verification key
const PIN_VERIFIED_KEY = "securevault_pin_verified";

export const Files: React.FC = () => {
  const navigate = useNavigate();
  const { files, uploadFile, deleteFile, downloadFile, isUploading, isLoading: isFilesLoading, storageUsed, storageLimit } = useVault();
  const { hasPin, isLoading: isPinLoading, createPin, verifyPin } = useEncryptionPin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  // PIN verification state for current session
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Check if PIN was already verified this session
  useEffect(() => {
    const verified = sessionStorage.getItem(PIN_VERIFIED_KEY);
    if (verified === "true") {
      setIsPinVerified(true);
    }
  }, []);

  // Determine what modal to show
  const showPinSetup = hasPin === false && !isPinLoading;
  const needsVerification = hasPin === true && !isPinVerified && !isPinLoading;

  // Show verification modal when needed
  useEffect(() => {
    if (needsVerification) {
      setShowVerifyModal(true);
    }
  }, [needsVerification]);

  const handlePinVerified = async (pin: string): Promise<boolean> => {
    const success = await verifyPin(pin);
    if (success) {
      setIsPinVerified(true);
      setShowVerifyModal(false);
      // Store in sessionStorage - clears on browser close/logout
      sessionStorage.setItem(PIN_VERIFIED_KEY, "true");
    }
    return success;
  };

  const handleVerifyCancel = () => {
    setShowVerifyModal(false);
    // Navigate back to dashboard if user cancels
    navigate("/dashboard");
  };

  const handlePinSetSuccess = async (pin: string): Promise<boolean> => {
    const success = await createPin(pin);
    if (success) {
      // After setting PIN, mark as verified for this session
      setIsPinVerified(true);
      sessionStorage.setItem(PIN_VERIFIED_KEY, "true");
    }
    return success;
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      for (const file of Array.from(selectedFiles)) {
        await uploadFile(file);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const storagePercentage = (storageUsed / storageLimit) * 100;

  // Show loading state while fetching files
  if (isFilesLoading || isPinLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* PIN Setup Modal */}
      <SetupPinModal open={showPinSetup} onPinSet={handlePinSetSuccess} />
      
      {/* PIN Verification Modal */}
      <VerifyPinModal 
        open={showVerifyModal} 
        onVerify={handlePinVerified}
        onCancel={handleVerifyCancel}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <FolderLock className="w-8 h-8 text-primary" />
            My Files
          </h1>
          <p className="text-muted-foreground mt-1">
            {files.length} encrypted files • {formatBytes(storageUsed)} used
          </p>
        </div>
        
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Encrypting...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Storage Bar */}
      <GlassCard padding="sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Storage</span>
          <span className="text-sm text-muted-foreground">
            {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          />
        </div>
      </GlassCard>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12"
        />
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">Drop files here to upload</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Files will be encrypted with AES-256 before storage
        </p>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          Select Files
        </Button>
      </div>

      {/* Files List */}
      {filteredFiles.length > 0 ? (
        <div className="space-y-3">
          {filteredFiles.map((file) => (
            <GlassCard key={file.id} padding="sm" className="hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-4">
                {/* File Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl">
                  {getFileIcon(file.type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{file.name}</h4>
                    <Lock className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatBytes(file.size)} • Encrypted {formatDate(file.encryptedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(file.id)}
                    className="hidden sm:flex"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadFile(file.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteFile(file.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : files.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your vault is empty</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Upload files to encrypt and securely store them in your vault.
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First File
          </Button>
        </GlassCard>
      ) : (
        <GlassCard className="text-center py-8">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-1">No files found</h3>
          <p className="text-sm text-muted-foreground">
            No files match "{searchQuery}"
          </p>
        </GlassCard>
      )}
    </div>
  );
};

export default Files;
