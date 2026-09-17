import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export const RSVPS_COLLECTION = 'rsvps';
export const RSVP_LIST_LIMIT = 300;

export interface RsvpEntry {
  id: string;
  guestName: string;
  attending: boolean;
  pax: number;
  message: string;
  guestSlug: string;
  side: string;
  createdAt: string | null;
}

function toEntry(snap: QueryDocumentSnapshot<DocumentData>): RsvpEntry {
  const d = snap.data();
  return {
    id: snap.id,
    guestName: String(d.guestName ?? 'Tamu'),
    attending: Boolean(d.attending),
    pax: Number(d.pax ?? 1),
    message: String(d.message ?? ''),
    guestSlug: String(d.guestSlug ?? ''),
    side: String(d.side ?? ''),
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : null,
  };
}

export function subscribeRsvps(onData: (entries: RsvpEntry[]) => void, onError: (e: Error) => void): () => void {
  if (!db) {
    onError(new Error('Firebase belum dikonfigurasi.'));
    return () => {};
  }
  const q = query(collection(db, RSVPS_COLLECTION), orderBy('createdAt', 'desc'), limit(RSVP_LIST_LIMIT));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(toEntry)),
    (err) => onError(err instanceof Error ? err : new Error(String(err))),
  );
}

export async function deleteRsvp(id: string): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  await deleteDoc(doc(db, RSVPS_COLLECTION, id));
}

/** Hubungkan entri tanpa slug ke tamu (agar bisa ikut sinkron). Khusus admin. */
export async function linkRsvpToGuest(id: string, guestSlug: string): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  if (!guestSlug) throw new Error('Pilih tamu dulu.');
  await updateDoc(doc(db, RSVPS_COLLECTION, id), { guestSlug });
}
