import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { fetchUserByEmail, registerSelf, type UserRole } from '../lib/users';

/** Role murni dari collection `users`. 'none' = belum tercatat (rules lama / gagal daftar). */
export type AccessLevel = UserRole | 'none';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<AccessLevel>('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Penyebab terakhir gagal resolve role (mis. permission-denied = rules belum update). */
  const [accessError, setAccessError] = useState<string | null>(null);

  const resolveAccess = useCallback(async (u: User | null) => {
    if (!u) {
      setAccess('none');
      return;
    }
    const email = (u.email ?? '').trim().toLowerCase();
    try {
      const doc = await fetchUserByEmail(email);
      if (doc) {
        setAccess(doc.role);
        setAccessError(null);
        return;
      }
      // Login pertama: daftarkan otomatis sebagai pending agar muncul di Firestore.
      await registerSelf(email, u.displayName);
      setAccess('pending');
      setAccessError(null);
    } catch (e) {
      setAccess('none');
      const msg = e instanceof Error ? e.message : String(e);
      setAccessError(msg);
      console.error('[auth] gagal resolve role:', msg);
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      void (async () => {
        setUser(u);
        await resolveAccess(u);
        setLoading(false);
      })();
    });
  }, [resolveAccess]);

  const login = async () => {
    if (!auth) {
      setError('Firebase belum dikonfigurasi. Isi file .env dulu.');
      return;
    }
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setLoading(true);
      await resolveAccess(cred.user);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : 'Login gagal. Coba lagi.');
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setUser(null);
    setAccess('none');
  };

  /** Dipakai dari layar "akses ditolak" setelah admin baru saja mendaftarkan email ini. */
  const refreshAccess = async () => {
    if (!user) return;
    setLoading(true);
    await resolveAccess(user);
    setLoading(false);
  };

  const blocked = !!user && (access === 'none' || access === 'pending') && !loading;

  return { user, access, loading, error, accessError, blocked, login, logout, refreshAccess };
}
