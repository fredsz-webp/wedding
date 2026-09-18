import { getApp, loadDb } from './firebase';

export type GiftSide = 'pria' | 'wanita';

export interface GiftInfo {
  bank: string;
  number: string;
  owner: string;
  address: string;
}

/** Dibaca sekali saat menu Gift dibuka. Gagal = null (pakai default lokal). */
export async function fetchGift(side: GiftSide): Promise<GiftInfo | null> {
  const app = getApp();
  if (!app) return null;
  try {
    const db = await loadDb(app);
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'settings', `gift-${side}`));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      bank: String(d.bank ?? ''),
      number: String(d.number ?? ''),
      owner: String(d.owner ?? ''),
      address: String(d.address ?? ''),
    };
  } catch {
    return null;
  }
}

/** Langganan realtime — perubahan dari dashboard langsung tampil tanpa reload. */
export function subscribeGift(side: GiftSide, onData: (g: GiftInfo | null) => void): () => void {
  const app = getApp();
  if (!app) {
    onData(null);
    return () => {};
  }
  let unsub: (() => void) | null = null;
  let cancelled = false;
  (async () => {
    try {
      const db = await loadDb(app);
      const { doc, onSnapshot } = await import('firebase/firestore');
      if (cancelled) return;
      unsub = onSnapshot(
        doc(db, 'settings', `gift-${side}`),
        (snap) => {
          if (!snap.exists()) {
            onData(null);
            return;
          }
          const d = snap.data();
          onData({
            bank: String(d.bank ?? ''),
            number: String(d.number ?? ''),
            owner: String(d.owner ?? ''),
            address: String(d.address ?? ''),
          });
        },
        () => onData(null),
      );
    } catch {
      if (!cancelled) onData(null);
    }
  })();
  return () => {
    cancelled = true;
    unsub?.();
  };
}
