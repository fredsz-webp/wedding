import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export type GiftSide = 'pria' | 'wanita';

/** Daftar bank yang ada logonya di undangan. Nilai disimpan huruf kapital. */
export const BANK_OPTIONS = ['BCA', 'BRI', 'BNI', 'MANDIRI', 'BSI'];

export interface GiftSettings {
  bank: string;
  number: string;
  owner: string;
  address: string;
  updatedAt?: string | null;
}

export const DEFAULT_GIFTS: Record<GiftSide, GiftSettings> = {  pria: {
    bank: 'BCA',
    number: '0000000000',
    owner: 'Khoyrul Yusuf Maulana',
    address: 'Dusun Singkil, RT.02/RW.03, Desa Karanggondang, Kec. Pabelan, Kab. Semarang',
  },
  wanita: {
    bank: 'BCA',
    number: '0000000000',
    owner: 'Aprilia Faragita',
    address: 'Dusun Tempel, RT.25/RW.06, Plumbon, Kec. Suruh, Kab. Semarang',
  },
};

function docId(side: GiftSide): string {
  return `gift-${side}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toGiftSettings(side: GiftSide, d: any): GiftSettings {
  const fallback = DEFAULT_GIFTS[side];
  return {
    bank: d.bank ? String(d.bank) : fallback.bank,
    number: d.number ? String(d.number) : fallback.number,
    owner: d.owner ? String(d.owner) : fallback.owner,
    address: d.address ? String(d.address) : fallback.address,
    updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : null,
  };
}

export async function fetchGiftSettings(side: GiftSide): Promise<GiftSettings> {
  if (!db) return DEFAULT_GIFTS[side];
  try {
    const snap = await getDoc(doc(db, 'settings', docId(side)));
    if (!snap.exists()) return DEFAULT_GIFTS[side];
    return toGiftSettings(side, snap.data());
  } catch {
    return DEFAULT_GIFTS[side];
  }
}

export async function saveGiftSettings(side: GiftSide, input: GiftSettings): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  const bank = input.bank.trim().toUpperCase();
  const number = input.number.replace(/\s+/g, '');
  const owner = input.owner.trim();
  const address = input.address.trim();
  if (!bank) throw new Error('Nama bank wajib diisi.');
  if (!number) throw new Error('Nomor rekening wajib diisi.');
  if (!owner) throw new Error('Atas nama wajib diisi.');
  if (!address) throw new Error('Alamat kado wajib diisi.');
  await setDoc(doc(db, 'settings', docId(side)), {
    bank,
    number,
    owner,
    address,
    updatedAt: serverTimestamp(),
  });
}
