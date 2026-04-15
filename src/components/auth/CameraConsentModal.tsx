import React, { useState } from "react";
import { Camera, ShieldAlert, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { CameraService } from "@/services/cameraService";

export const CameraConsentModal: React.FC = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Show if user is authenticated but consent is undefined
  const shouldShow = user != null && user.cameraConsent === undefined;

  const handleConsent = async (consent: boolean) => {
    if (!user) return;
    setIsProcessing(true);

    try {
      if (consent) {
        // Technically request permissions from browser if accepted
        // This prompts the user's browser, which creates a better UX
        const hasPerm = await CameraService.hasCameraPermission();
        if (!hasPerm) {
          // If no permission, we can try to trigger it by asking for capture temporarily
          // Or just save consent and let the failure happen silently on 3rd attempt
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            stream.getTracks().forEach(track => track.stop());
          } catch (e) {
             // User denied browser permission right after accepting our modal
             console.log("Browser camera permission denied.");
             // We'll still save their preference to the db, but the browser will block us later anyway.
          }
        }
      }

      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { cameraConsent: consent });
      // We don't force a user object refresh here because AuthContext relies on snapshot or re-render
      // Oh wait, AuthContext doesn't have an exact realtime snapshot on user profile, 
      // but modifying window location or just hiding modal is enough if we rely on `user` state. 
      // But actually, we can't mutate `user` directly. However, we can just reload the page or 
      // rely on the user to see the changed state next load. 
      // Actually, better to just reload to guarantee AuthContext hydration.
      window.location.reload();
    } catch (error) {
      console.error("Error saving camera consent", error);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={shouldShow} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden pointer-events-none" hideCloseButton>
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Security Consent Required</DialogTitle>
          <DialogDescription className="text-center pt-2">
            This application may access your camera to capture images during suspicious activity (e.g. repeated failed PIN attempts) for your security.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4 pointer-events-auto">
          <Button 
            onClick={() => handleConsent(true)} 
            disabled={isProcessing}
            className="w-full h-11"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
            Accept & Enable Camera
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleConsent(false)}
            disabled={isProcessing}
            className="w-full h-11"
          >
            Decline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
