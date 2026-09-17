import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/** Satu-satunya tempat inisialisasi Firebase di web undangan. */
export function getDb(): Firestore | null {
  try {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;
    if (!apiKey || !authDomain || !projectId || !appId) return null;
    const app = getApps().length
      ? getApps()[0]!
      : initializeApp({
          apiKey,
          authDomain,
          projectId,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
          appId,
        });
    return getFirestore(app);
  } catch {
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return getDb() !== null;
}
