import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase';

export interface Wish {
  id: string;
  guestName: string;
  attending: boolean;
  pax: number;
  message: string;
  guestSlug: string;
  side: string;
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

export async function submitRsvp(input: RsvpInput): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('RSVP online belum dikonfigurasi. Hubungi mempelai untuk konfirmasi manual.');
  const err = validate(input);
  if (err) throw new Error(err);
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
): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('RSVP online belum dikonfigurasi. Hubungi mempelai untuk konfirmasi manual.');
  if (!id) throw new Error('Data konfirmasi tidak ditemukan.');
  const err = validateEditable(input);
  if (err) throw new Error(err);
  await updateDoc(doc(db, 'rsvps', id), {
    guestName: input.guestName.trim(),
    attending: input.attending,
    pax: input.attending ? Math.max(1, Math.min(10, Math.round(input.pax))) : 1,
    message: input.message.trim(),
    updatedAt: serverTimestamp(),
  });
}
export async function findRsvpBySlug(slug: string): Promise<Wish | null> {
  const db = getDb();
  if (!db || !slug) return null;
  try {
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
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
    };
  } catch {
    return null;
  }
}

/** Daftar ucapan terbaru (realtime). */
export function useWishes(side: 'pria' | 'wanita', max = 50): { wishes: Wish[]; loading: boolean } {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDb();
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'), limit(max));
    return onSnapshot(q, (snap) => {
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
          side: String(data.side ?? side),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
        });
      });
      setWishes(items);
      setLoading(false);
    });
  }, [side, max]);

  return { wishes, loading };
}
