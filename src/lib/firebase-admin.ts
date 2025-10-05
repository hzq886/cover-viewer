import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let firestoreInstance: Firestore | undefined;

function ensureAdminAppInitialized() {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

export function getFirebaseAdminAuth() {
  ensureAdminAppInitialized();

  return getAuth();
}

export function getFirebaseAdminFirestore(): Firestore {
  ensureAdminAppInitialized();

  if (!firestoreInstance) {
    firestoreInstance = getFirestore();
  }

  return firestoreInstance;
}
