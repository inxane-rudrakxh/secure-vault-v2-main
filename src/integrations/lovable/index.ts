import { OAuthProvider, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/integrations/firebase/client";

type OAuthProviderName = "google" | "github";

function createProvider(provider: OAuthProviderName) {
  if (provider === "google") return new GoogleAuthProvider();
  if (provider === "github") return new GithubAuthProvider();
  return new OAuthProvider(provider);
}

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: OAuthProviderName,
      _opts?: { redirect_uri?: string }
    ) => {
      try {
        await signInWithPopup(auth, createProvider(provider));
        return { redirected: false };
      } catch (error) {
        return { error: error instanceof Error ? error : new Error(String(error)) };
      }
    },
  },
};
