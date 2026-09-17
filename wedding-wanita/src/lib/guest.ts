import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDb } from './firebase';

const FALLBACK_NAME = 'Tamu Undangan';

/** Ambil nama tamu dari URL. Prioritas: Firestore (?u=slug) -> ?to= -> fallback. */
export function getInstantGuestName(): { instant: string; slug: string | null } {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('u') || params.get('id') || params.get('slug');
  const raw = params.get('to') || params.get('guest') || params.get('nama');
  const instant = raw ? decodeURIComponent(raw.replace(/\+/g, ' ')).trim() : '';
  return { instant: instant || FALLBACK_NAME, slug };
}

export interface GuestInfo {
  slug: string | null;
  /** Nama tampil: ?to= langsung, lalu nama resmi Firestore bila ada ?u=. */
  name: string;
  /** Event tercentang tamu. Null = tak diketahui (tanpa slug / tanpa Firebase). */
  events: string[] | null;
}

async function markOpenedOnce(docId: string) {
  try {
    const key = `guest-opened-${docId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const db = getDb();
    if (!db) return;
    await updateDoc(doc(db, 'guests', docId), {
      opened: true,
      openedAt: serverTimestamp(),
      viewCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch {
    /* abaikan — status buka hanya telemetri */
  }
}

/**
 * SATU-SATUNYA query dokumen tamu per bukaan undangan.
 * Dipakai bersama oleh cover (nama) & kartu (centangan acara) agar cukup 1x baca.
 */
export function useGuest(): GuestInfo {
  const [{ instant, slug }] = useState(getInstantGuestName);
  const [info, setInfo] = useState<GuestInfo>({ slug, name: instant, events: null });

  useEffect(() => {
    if (!slug) return;
    const db = getDb();
    if (!db) return;
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, 'guests'), where('slug', '==', slug), limit(1));
        const snap = await getDocs(q);
        if (cancelled || snap.empty) return;
        const data = snap.docs[0]!.data();
        const official = String(data.name ?? '').trim();
        const raw = data.events;
        setInfo({
          slug,
          name: official || instant,
          events: Array.isArray(raw) ? raw.map((v) => String(v)) : [],
        });
        void markOpenedOnce(snap.docs[0]!.id);
      } catch {
        /* offline / rules menolak — tetap pakai ?to= */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, instant]);

  return info;
}
