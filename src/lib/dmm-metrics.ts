import { FieldValue, type Firestore } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "./firebase-admin";
import {
  DAILY_SUBCOLLECTION,
  DMM_API_DOC,
  METRICS_COLLECTION,
} from "./keyword-metrics";

export function incrementDmmDailyApiCount(
  db: Firestore = getFirebaseAdminFirestore(),
): Promise<void> {
  const metrics = db.collection(METRICS_COLLECTION);
  const dateKey = new Date().toISOString().slice(0, 10);
  return metrics
    .doc(DMM_API_DOC)
    .collection(DAILY_SUBCOLLECTION)
    .doc(dateKey)
    .set(
      {
        count: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
    .then(() => undefined);
}
