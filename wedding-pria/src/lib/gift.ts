import { useEffect, useState } from 'react';
import { getApp, loadDb } from './firebase';

export type GiftSide = 'pria' | 'wanita';

export interface GiftInfo {
  bank: string;
  number: string;
  owner: string;
  address: string;
}

function mapGift(d: Record<string, unknown>): GiftInfo {
  return {
    bank: String(d.bank ?? ''),
    number: String(d.number ?? ''),
    owner: String(d.owner ?? ''),
    address: String(d.address ?? ''),
  };
}

// Cache + langganan bersama: diambil sekali (prefetch saat undangan dibuka),
// dipakai ulang tiap menu Gift dibuka — tidak load ulang.
const giftCache = new Map<GiftSide, GiftInfo>();
const giftStarted = new Set<GiftSide>();
const giftListeners = new Map<GiftSide, Set<(g: GiftInfo | null) => void>>();

function ensureGiftSub(side: GiftSide): void {
  const app = getApp();
  if (!app || giftStarted.has(side)) return;
  giftStarted.add(side);
  void (async () => {
    try {
      const db = await loadDb(app);
      const { doc, onSnapshot } = await import('firebase/firestore');
      onSnapshot(
        doc(db, 'settings', `gift-${side}`),
        (snap) => {
          const g = snap.exists() ? mapGift(snap.data()) : null;
          if (g) giftCache.set(side, g);
          giftListeners.get(side)?.forEach((fn) => fn(g));
        },
        () => {
          giftStarted.delete(side);
          giftListeners.get(side)?.forEach((fn) => fn(giftCache.get(side) ?? null));
        },
      );
    } catch {
      giftStarted.delete(side);
      giftListeners.get(side)?.forEach((fn) => fn(giftCache.get(side) ?? null));
    }
  })();
}

/** Panggil sekali saat undangan dibuka — data siap sebelum menu Gift dibuka. */
export function prefetchGift(side: GiftSide): void {
  ensureGiftSub(side);
}

/** Data gift realtime (berbagi satu langganan + cache). */
export function useGift(side: GiftSide): { gift: GiftInfo | null; loading: boolean } {
  const [gift, setGift] = useState<GiftInfo | null>(() => giftCache.get(side) ?? null);
  const [loading, setLoading] = useState(() => !giftCache.has(side));

  useEffect(() => {
    ensureGiftSub(side);
    let fns = giftListeners.get(side);
    if (!fns) {
      fns = new Set();
      giftListeners.set(side, fns);
    }
    const fn = (g: GiftInfo | null) => {
      if (g) setGift(g);
      setLoading(false);
    };
    fns.add(fn);
    const cached = giftCache.get(side);
    if (cached) {
      setGift(cached);
      setLoading(false);
    }
    if (!getApp()) setLoading(false);
    return () => {
      fns!.delete(fn);
    };
  }, [side]);

  return { gift, loading };
}
