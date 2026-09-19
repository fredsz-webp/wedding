import { useEffect, useState } from 'react';
import { getApp, isFirebaseConfigured, loadDb } from './firebase';

export interface Wish {
  id: string;
  guestName: string;
  attending: boolean;
  pax: number;
  message: string;
  guestSlug: string;
  side: string;
  likes: number;
  createdAt: string | null;
}

export interface RsvpInput {
  guestName: string;
  attending: boolean;
  pax: number;
  message: string;
  guestSlug: string;
  side: 'pria' | 'wanita';
}

export function isRsvpConfigured(): boolean {
  return isFirebaseConfigured();
}

/** Jeda minimum pengisian form (detik) — pencegat bot yang submit instan. */
export const MIN_FILL_SECONDS = 3;

function validateEditable(input: { guestName: string; attending: boolean; pax: number; message: string }): string | null {
  if (!input.guestName.trim()) return 'Nama wajib diisi.';
  if (input.guestName.trim().length > 60) return 'Nama maksimal 60 karakter.';
  if (!input.message.trim()) return 'Tulis ucapan & doa restu dulu ya.';
  if (input.message.trim().length > 500) return 'Ucapan maksimal 500 karakter.';
  if (input.pax < 1 || input.pax > 10) return 'Jumlah kehadiran 1–10 orang.';
  return null;
}

function validate(input: RsvpInput): string | null {
  return validateEditable(input);
}

/**
 * Pastikan slug di link (?u=…) benar-benar terdaftar di Daftar Tamu.
 * Menolak link karangan (format benar tapi slug tidak ada di database).
 * Catatan: ini validasi sisi klien. Koleksi `guests` memang boleh dibaca publik
 * agar cover bisa tampil tanpa login — pengetatan level rules butuh migrasi
 * (jadikan slug sebagai ID dokumen) dan sengaja tidak dilakukan di sini.
 */
export async function assertGuestSlugRegistered(slug: string): Promise<void> {
  const clean = (slug ?? '').trim();
  if (!clean) throw new Error('Tautan undangan tidak valid. Gunakan link personal dari admin/panitia.');
  const app = getApp();
  if (!app) throw new Error('RSVP online belum dikonfigurasi. Hubungi mempelai untuk konfirmasi manual.');
  const db = await loadDb(app);
  const { collection, getDocs, limit, query, where } = await import('firebase/firestore');
  const q = query(collection(db, 'guests'), where('slug', '==', clean), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Tautan undangan tidak terdaftar. Gunakan link personal dari admin/panitia.');
}

export async function submitRsvp(input: RsvpInput): Promise<void> {
  const app = getApp();
  if (!app) throw new Error('RSVP online belum dikonfigurasi. Hubungi mempelai untuk konfirmasi manual.');
  const err = validate(input);
  if (err) throw new Error(err);
  // Link harus benar-benar terdaftar di Daftar Tamu — link karangan ditolak.
  await assertGuestSlugRegistered(input.guestSlug);
  const db = await loadDb(app);
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  await addDoc(collection(db, 'rsvps'), {
    guestName: input.guestName.trim(),
    attending: input.attending,
    pax: input.attending ? Math.max(1, Math.min(10, Math.round(input.pax))) : 1,
    message: input.message.trim(),
    guestSlug: input.guestSlug,
    side: input.side,
    createdAt: serverTimestamp(),
  });
}

/** Perbarui kiriman sendiri via link personal (doc id didapat dari findRsvpBySlug). */
export async function updateRsvp(
  id: string,
  input: { guestName: string; attending: boolean; pax: number; message: string },
  guestSlug?: string,
): Promise<void> {
  const app = getApp();
  if (!app) throw new Error('RSVP online belum dikonfigurasi. Hubungi mempelai untuk konfirmasi manual.');
  if (!id) throw new Error('Data konfirmasi tidak ditemukan.');
  const err = validateEditable(input);
  if (err) throw new Error(err);
  // Link harus benar-benar terdaftar di Daftar Tamu — link karangan ditolak.
  if (guestSlug !== undefined) await assertGuestSlugRegistered(guestSlug);
  const db = await loadDb(app);
  const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(db, 'rsvps', id), {
    guestName: input.guestName.trim(),
    attending: input.attending,
    pax: input.attending ? Math.max(1, Math.min(10, Math.round(input.pax))) : 1,
    message: input.message.trim(),
    updatedAt: serverTimestamp(),
  });
}
export async function findRsvpBySlug(slug: string): Promise<Wish | null> {
  const app = getApp();
  if (!app || !slug) return null;
  try {
    const db = await loadDb(app);
    const { collection, getDocs, limit, query, where } = await import('firebase/firestore');
    const q = query(collection(db, 'rsvps'), where('guestSlug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0]!;
    const data = d.data();
    return {
      id: d.id,
      guestName: String(data.guestName ?? 'Tamu'),
      attending: Boolean(data.attending),
      pax: Number(data.pax ?? 1),
      message: String(data.message ?? ''),
      guestSlug: String(data.guestSlug ?? ''),
      side: String(data.side ?? ''),
      likes: typeof data.likes === 'number' ? data.likes : 0,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
    };
  } catch {
    return null;
  }
}

type Side = 'pria' | 'wanita';

/** Like/unlike ucapan (±1). 1 perangkat 1 suara — dicatat di localStorage. */
export async function likeWish(id: string, delta: 1 | -1): Promise<void> {
  const app = getApp();
  if (!app || !id) throw new Error('Tidak dapat memberi like.');
  const db = await loadDb(app);
  const { doc, updateDoc, increment, serverTimestamp } = await import('firebase/firestore');
  await updateDoc(doc(db, 'rsvps', id), {
    likes: increment(delta),
    updatedAt: serverTimestamp(),
  });
}

const LIKED_KEY = 'wedding-likes';

/** Sumber kebenaran utama (selalu jalan, bahkan jika localStorage diblokir). */
const likedMemory = new Set<string>();

function readLikedIds(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.map(String) : [];
  } catch {
    return [];
  }
}

export function isLiked(id: string): boolean {
  return likedMemory.has(id) || readLikedIds().includes(id);
}

export function setLikedId(id: string, liked: boolean): void {
  if (liked) likedMemory.add(id);
  else likedMemory.delete(id);
  try {
    const ids = readLikedIds().filter((v) => v !== id);
    if (liked) ids.push(id);
    localStorage.setItem(LIKED_KEY, JSON.stringify(ids));
  } catch {
    /* abaikan — memory tetap jalan */
  }
}

function mapWishes(snap: { forEach: (fn: (d: { id: string; data: () => Record<string, unknown> }) => void) => void }, fallbackSide: Side): Wish[] {
  const items: Wish[] = [];
  snap.forEach((d) => {
    const data = d.data();
    const msg = String(data.message ?? '').trim();
    if (!msg) return;
    items.push({
      id: d.id,
      guestName: String(data.guestName ?? 'Tamu'),
      attending: Boolean(data.attending),
      pax: Number(data.pax ?? 1),
      message: msg,
      guestSlug: String(data.guestSlug ?? ''),
      side: String(data.side ?? fallbackSide),
      likes: typeof data.likes === 'number' ? data.likes : 0,
      createdAt:
        data.createdAt && typeof (data.createdAt as { toDate?: unknown }).toDate === 'function'
          ? (data.createdAt as { toDate: () => Date }).toDate().toISOString()
          : null,
    });
  });
  return items;
}

// Langganan realtime bersama: dimulai sekali (prefetch saat app dibuka),
// dipakai ulang semua hook agar data sudah siap saat menu RSVP dibuka.
const wishesCache = new Map<Side, Wish[]>();
const wishesStarted = new Set<Side>();
const wishesListeners = new Map<Side, Set<(items: Wish[]) => void>>();

function ensureWishesSub(side: Side): void {
  const app = getApp();
  if (!app || wishesStarted.has(side)) return;
  wishesStarted.add(side);
  void (async () => {
    try {
      const db = await loadDb(app);
      const { collection, limit, onSnapshot, orderBy, query } = await import('firebase/firestore');
      const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'), limit(50));
      onSnapshot(
        q,
        (snap) => {
          const items = mapWishes(snap, side);
          wishesCache.set(side, items);
          wishesListeners.get(side)?.forEach((fn) => fn(items));
        },
        () => {
          // Gagal (mis. offline): izinkan coba lagi nanti, hentikan loading listener.
          wishesStarted.delete(side);
          wishesListeners.get(side)?.forEach((fn) => fn(wishesCache.get(side) ?? []));
        },
      );
    } catch {
      wishesStarted.delete(side);
      wishesListeners.get(side)?.forEach((fn) => fn(wishesCache.get(side) ?? []));
    }
  })();
}

/** Panggil sekali saat app dibuka — daftar ucapan sudah tiba sebelum menu RSVP dibuka. */
export function prefetchWishes(side: Side): void {
  ensureWishesSub(side);
}

/** Daftar ucapan terbaru (realtime, berbagi satu langganan). */
export function useWishes(side: Side): { wishes: Wish[]; loading: boolean } {
  const [wishes, setWishes] = useState<Wish[]>(() => wishesCache.get(side) ?? []);
  const [loading, setLoading] = useState(() => !wishesCache.has(side));

  useEffect(() => {
    ensureWishesSub(side);
    let fns = wishesListeners.get(side);
    if (!fns) {
      fns = new Set();
      wishesListeners.set(side, fns);
    }
    const fn = (items: Wish[]) => {
      setWishes(items);
      setLoading(false);
    };
    fns.add(fn);
    // Kalau cache sudah ada (dari prefetch), langsung tampil.
    const cached = wishesCache.get(side);
    if (cached) {
      setWishes(cached);
      setLoading(false);
    }
    // Tanpa Firebase (belum dikonfigurasi): jangan loading selamanya.
    if (!getApp()) setLoading(false);
    return () => {
      fns!.delete(fn);
    };
  }, [side]);

  return { wishes, loading };
}
