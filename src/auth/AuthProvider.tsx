"use client";

import {
  signOut as firebaseSignOut,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailLink,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error?: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { dictionary } = useI18n();
  const authText = dictionary.auth;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to firebase auth state
  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Complete email-link login if needed
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasFirebaseConfig()) return;
    const href = window.location.href;
    const auth = getFirebaseAuth();
    if (!isSignInWithEmailLink(auth, href)) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        let email = window.localStorage.getItem("emailForSignIn") || "";
        if (!email) {
          // Ask user to input email if not available locally
          // eslint-disable-next-line no-alert
          email = window.prompt(authText.promptEmail, "") || "";
        }
        if (!email) {
          setError(authText.emailRequired);
          setLoading(false);
          return;
        }
        await signInWithEmailLink(auth, email, href);
        try {
          window.localStorage.removeItem("emailForSignIn");
        } catch {}
        // Strip the OOB params from URL
        router.replace("/");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router, authText.promptEmail, authText.emailRequired]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      error,
      signOut: async () => {
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
      },
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
