import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export const USERS_COLLECTION = 'users';

/** admin = akses penuh (tamu + kelola pengguna). panitia = kelola tamu saja. pending = baru daftar, menunggu persetujuan. */
export type AppRole = 'admin' | 'panitia';
export type UserRole = AppRole | 'pending';

export interface AppUser {
  /** = email lowercase (doc id) */
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdBy: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const APP_ROLES: AppRole[] = ['admin', 'panitia'];

export function emailToId(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAppUser(id: string, d: any): AppUser {
  const role: UserRole = d.role === 'panitia' ? 'panitia' : d.role === 'pending' ? 'pending' : 'admin';
  return {
    id,
    email: String(d.email ?? id),
    name: d.name ? String(d.name) : null,
    role,
    createdBy: d.createdBy ? String(d.createdBy) : null,
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : null,
    updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : null,
  };
}

/** Dipakai saat login untuk menentukan role. Return null = bukan pengguna terdaftar. */
export async function fetchUserByEmail(email: string): Promise<AppUser | null> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  const id = emailToId(email);
  if (!id) return null;
  const snap = await getDoc(doc(db, USERS_COLLECTION, id));
  if (!snap.exists()) return null;
  return toAppUser(snap.id, snap.data());
}

/** Pendaftaran otomatis saat login pertama: tercatat sebagai `pending`, menunggu di-approve admin. */
export async function registerSelf(email: string, name: string | null): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  const id = emailToId(email);
  if (!id) throw new Error('Email tidak valid.');
  const ref = doc(db, USERS_COLLECTION, id);
  if ((await getDoc(ref)).exists()) return;
  await setDoc(ref, {
    email: id,
    name: name?.trim() || null,
    role: 'pending',
    createdBy: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeUsers(onData: (users: AppUser[]) => void, onError: (e: Error) => void): () => void {
  if (!db) {
    onError(new Error('Firebase belum dikonfigurasi.'));
    return () => {};
  }
  const q = query(collection(db, USERS_COLLECTION), orderBy('email'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => toAppUser(d.id, d.data()))),
    (err) => onError(err instanceof Error ? err : new Error(String(err))),
  );
}

export async function addUser(email: string, role: AppRole, createdBy: string | null): Promise<void> {  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  const clean = emailToId(email);
  if (!isValidEmail(clean)) throw new Error('Format email tidak valid.');
  const ref = doc(db, USERS_COLLECTION, clean);
  if ((await getDoc(ref)).exists()) throw new Error('Email ini sudah terdaftar.');
  await setDoc(ref, {
    email: clean,
    name: null,
    role,
    createdBy: createdBy ? emailToId(createdBy) : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function setUserRole(id: string, role: AppRole): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  await updateDoc(doc(db, USERS_COLLECTION, id), { role, updatedAt: serverTimestamp() });
}

export async function removeUser(id: string): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  await deleteDoc(doc(db, USERS_COLLECTION, id));
}
