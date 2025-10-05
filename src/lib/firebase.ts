// Firebase initialization for client-side usage
// Do not import this module from server-side code.

import { type Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Optional fields
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let analytics: Analytics | undefined;
let analyticsInitPromise: Promise<Analytics | undefined> | undefined;

export function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseConfig()) {
    throw new Error("Missing Firebase config env vars");
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth must be called in the browser");
  }
  return getAuth(getFirebaseApp());
}

export function getFirestoreDb(): Firestore {
  if (typeof window === "undefined") {
    throw new Error("getFirestoreDb must be called in the browser");
  }
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}

export async function getFirebaseAnalytics(): Promise<Analytics | undefined> {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAnalytics must be called in the browser");
  }
  if (!firebaseConfig.measurementId) {
    throw new Error("Missing Firebase measurement ID env var");
  }
  if (analytics) {
    return analytics;
  }
  if (!analyticsInitPromise) {
    analyticsInitPromise = isSupported().then((supported) => {
      if (!supported) {
        return undefined;
      }
      analytics = getAnalytics(getFirebaseApp());
      return analytics;
    });
  }
  return analyticsInitPromise;
}
