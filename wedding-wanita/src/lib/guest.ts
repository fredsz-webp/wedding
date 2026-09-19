import { useEffect, useState } from 'react';
import { getApp, loadDb } from './firebase';

const FALLBACK_NAME = 'Tamu Undangan';

/**
 * Turunkan nama tampilan dari slug (`nama-tamu-xxxx` → "Nama Tamu") agar cover
 * langsung terisi tanpa menunggu fetch Firestore dan tanpa butuh ?to=.
 * Sufiks acak terakhir selalu dibuang; kapitalisasi tiap kata.
 */
export function nameFromSlug(slug: string): string {
  const clean = (slug ?? '').trim().toLowerCase();
  if (!clean) return '';
  const base = clean.replace(/-[a-z0-9]{1,4}$/, '');
  if (!base || base === 'tamu') return '';
  return base
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Ambil nama tamu dari URL. Prioritas: ?to= -> turunkan dari ?u=slug -> fallback. */
export function getInstantGuestName(): { instant: string; slug: string | null } {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('u') || params.get('id') || params.get('slug');
  const raw = params.get('to') || params.get('guest') || params.get('nama');
  const fromTo = raw ? decodeURIComponent(raw.replace(/\+/g, ' ')).trim() : '';
  const instant = fromTo || (slug ? nameFromSlug(slug) : '');
  return { instant: instant || FALLBACK_NAME, slug };
}

export interface GuestInfo {
  slug: string | null;
  /** Nama tampil: ?to= langsung, lalu nama resmi Firestore bila ada ?u=. */
  name: string;
  /** Event tercentang tamu. Null = tak diketahui (tanpa slug / tanpa Firebase). */
  events: string[] | null;
  /** True bila slug ada tapi TIDAK terdaftar (link karangan) — semua akses dikunci. */
  invalid: boolean;
}

async function markOpenedOnce(docId: string) {
  try {
    const key = `guest-opened-${docId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    const app = getApp();
    if (!app) return;
    // Import malas: modul besar firebase/firestore tidak ikut bundle awal.
    const db = await loadDb(app);
    const { doc, updateDoc, serverTimestamp, increment } = await import('firebase/firestore');
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
  const [info, setInfo] = useState<GuestInfo>({ slug, name: instant, events: null, invalid: false });

  useEffect(() => {
    if (!slug) return;
    const app = getApp();
    if (!app) return;
    let cancelled = false;
    (async () => {
      try {
        const db = await loadDb(app);
        const { collection, getDocs, limit, query, where } = await import('firebase/firestore');
        const q = query(collection(db, 'guests'), where('slug', '==', slug), limit(1));
        const snap = await getDocs(q);
        if (cancelled) return;
        if (snap.empty) {
          // Slug ada tapi TIDAK terdaftar (link karangan) → paksa nama fallback,
          // abaikan ?to= agar nama palsu tidak tampil di cover.
          setInfo({ slug, name: FALLBACK_NAME, events: [], invalid: true });
          return;
        }
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
