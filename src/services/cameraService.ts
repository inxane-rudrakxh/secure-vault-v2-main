export class CameraService {
  /**
   * Captures a single image from the user's camera.
   * @returns A Promise resolving to a base64 encoded string of the captured image, or null if it fails/is denied.
   */
  static async captureImage(): Promise<string | null> {
    try {
      // Access the camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // Use front camera
        audio: false,
      });

      // Create a hidden video element to play the stream
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Wait for the video to be ready and playing
      await new Promise<void>((resolve) => {
        video.onplaying = () => resolve();
      });

      // Create a canvas to draw the video frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Draw the current video frame onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 image (JPEG, 80% quality)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

      // Clean up: stop all tracks to turn off the camera light
      stream.getTracks().forEach((track) => track.stop());

      return dataUrl;
    } catch (error) {
      console.error("Camera Service Error:", error);
      return null;
    }
  }

  /**
   * Checks if camera permission has been granted by the browser.
   */
  static async hasCameraPermission(): Promise<boolean> {
    if (!navigator.permissions || !navigator.permissions.query) {
      return false; // For browsers that don't support permissions API properly yet
    }
    try {
      const result = await navigator.permissions.query({ name: "camera" as PermissionName });
      return result.state === "granted";
    } catch (error) {
      return false;
    }
  }
}
