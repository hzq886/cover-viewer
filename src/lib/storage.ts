import {
  deleteObject,
  type FirebaseStorage,
  getDownloadURL,
  getMetadata,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getFirebaseApp, hasFirebaseConfig } from "@/lib/firebase";

let storage: FirebaseStorage | undefined;

export function getFirebaseStorage(): FirebaseStorage {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseStorage must be called in the browser");
  }
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase config not found");
  }
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}

export function getStorageRef(path: string) {
  return ref(getFirebaseStorage(), path);
}

export { deleteObject, getDownloadURL, getMetadata, uploadBytes };
