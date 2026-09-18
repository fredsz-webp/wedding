import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

/** Inisialisasi Firebase App saja (ringan). Firestore di-import malas di pemakai. */
export function getApp(): FirebaseApp | null {
  try {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;
    if (!apiKey || !authDomain || !projectId || !appId) return null;
    return getApps().length
      ? getApps()[0]!
      : initializeApp({
          apiKey,
          authDomain,
          projectId,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
          appId,
        });
  } catch {
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return getApp() !== null;
}

/** Ambil instance Firestore untuk Firebase App ( modul besar — panggil setelah dynamic import ). */
export async function loadDb(app: FirebaseApp) {
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(app);
}
