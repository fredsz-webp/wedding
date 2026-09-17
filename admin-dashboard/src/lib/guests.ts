import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export const GUESTS_COLLECTION = 'guests';

export type GuestSide = 'pria' | 'wanita' | 'umum';
export type GuestGroup = 'Keluarga' | 'Sahabat' | 'Rekan Kerja' | 'Tetangga' | 'Lainnya';
export type RsvpStatus = 'pending' | 'hadir' | 'tidak';

/** Acara yang dihadiri — sesuai jadwal di undangan. */
export type GuestEvent = 'pria-11-okt' | 'wanita-3-okt' | 'wanita-4-okt';

export const EVENT_OPTIONS: { value: GuestEvent; label: string; short: string; card: string; sub?: string }[] = [
  { value: 'pria-11-okt', label: 'Minggu, 11 Okt 2026 · 13.00–20.00 WIB (Pria)', short: '11 Okt', card: 'Minggu, 11 Oktober 2026   Pukul: 13.00-20.00 WIB' },
  { value: 'wanita-3-okt', label: 'Sabtu, 3 Okt 2026 · 08.00–19.00 (Wanita)', short: '3 Okt', card: 'Sabtu, 3 Oktober 2026   Pukul: 08.00-19.00' },
  { value: 'wanita-4-okt', label: 'Minggu, 4 Okt 2026 · 08.00–12.00 · Ngunduh Mantu & Resepsi (Wanita)', short: '4 Okt', card: 'Minggu, 4 Oktober 2026   Pukul: 08.00-12.00 WIB', sub: 'Acara: Ngunduh Mantu & Resepsi' },
];

export function eventLabel(value: GuestEvent): string {
  return EVENT_OPTIONS.find((e) => e.value === value)?.label ?? value;
}

export function eventShort(value: GuestEvent): string {
  return EVENT_OPTIONS.find((e) => e.value === value)?.short ?? value;
}

/** Centangan default sesuai sisi undangan. */
export function defaultEventsForSide(side: GuestSide): GuestEvent[] {
  if (side === 'pria') return ['pria-11-okt'];
  if (side === 'wanita') return ['wanita-3-okt', 'wanita-4-okt'];
  return ['pria-11-okt', 'wanita-3-okt', 'wanita-4-okt'];
}

function sanitizeEvents(raw: unknown, side: GuestSide): GuestEvent[] {
  const valid = EVENT_OPTIONS.map((e) => e.value);
  if (!Array.isArray(raw)) return defaultEventsForSide(side);
  const clean = raw.filter((v): v is GuestEvent => valid.includes(v as GuestEvent));
  return clean.length > 0 ? [...new Set(clean)] : defaultEventsForSide(side);
}

export interface Guest {
  id: string;
  /** Nama tamu persis seperti yang tampil di cover undangan */
  name: string;
  /** Slug unik untuk link ?u=slug (dibuat otomatis dari nama) */
  slug: string;
  phone?: string;
  address?: string;
  group: GuestGroup;
  side: GuestSide;
  rsvp: RsvpStatus;
  pax: number;
  note?: string;
  /** Acara yang diundang (centang di dashboard). */
  events: GuestEvent[];
  /** Diisi otomatis saat tamu membuka link undangan (?u=slug) */
  opened: boolean;
  openedAt?: string | null;
  viewCount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type GuestInput = Pick<Guest, 'name' | 'group' | 'side'> &
  Partial<Pick<Guest, 'phone' | 'address' | 'rsvp' | 'pax' | 'note' | 'events'>>;

export const GUEST_GROUPS: GuestGroup[] = ['Keluarga', 'Sahabat', 'Rekan Kerja', 'Tetangga', 'Lainnya'];
export const GUEST_SIDES: GuestSide[] = ['pria', 'wanita', 'umum'];

/** "Bpk. H. Ahmad & Keluarga" -> "bpk-h-ahmad-keluarga-x7k2" */
export function makeSlug(name: string): string {
  const base =
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'tamu';
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}-${rand}`;
}

function snapToGuest(snap: QueryDocumentSnapshot<DocumentData>): Guest {
  const d = snap.data();
  const side = (d.side as GuestSide) ?? 'umum';
  return {
    id: snap.id,
    name: String(d.name ?? ''),
    slug: String(d.slug ?? snap.id),
    phone: d.phone ? String(d.phone) : undefined,
    address: d.address ? String(d.address) : undefined,
    group: (d.group as GuestGroup) ?? 'Lainnya',
    side,
    rsvp: (d.rsvp as RsvpStatus) ?? 'pending',
    pax: Number(d.pax ?? 1),
    note: d.note ? String(d.note) : undefined,
    events: sanitizeEvents(d.events, side),
    opened: Boolean(d.opened),
    openedAt: d.openedAt?.toDate ? d.openedAt.toDate().toISOString() : (d.openedAt ?? null),
    viewCount: Number(d.viewCount ?? 0),
    createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : null,
    updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : null,
  };
}

export function subscribeGuests(onData: (guests: Guest[]) => void, onError: (e: Error) => void): () => void {
  if (!db) {
    onError(new Error('Firebase belum dikonfigurasi. Isi file .env terlebih dahulu.'));
    return () => {};
  }
  const q = query(collection(db, GUESTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map(snapToGuest)),
    (err) => onError(err instanceof Error ? err : new Error(String(err))),
  );
}

export async function createGuest(input: GuestInput): Promise<string> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  const name = input.name.trim();
  if (!name) throw new Error('Nama tamu wajib diisi.');
  const ref = await addDoc(collection(db, GUESTS_COLLECTION), {
    name,
    slug: makeSlug(name),
    phone: input.phone?.trim() || null,
    address: input.address?.trim() || null,
    group: input.group,
    side: input.side,
    rsvp: input.rsvp ?? 'pending',
    pax: Math.max(1, Math.min(10, Number(input.pax ?? 1))),
    note: input.note?.trim() || null,
    events: sanitizeEvents(input.events, input.side),
    opened: false,
    openedAt: null,
    viewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateGuest(id: string, patch: Partial<GuestInput & { rsvp: RsvpStatus }>): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  const clean: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) throw new Error('Nama tamu tidak boleh kosong.');
    clean.name = name;
  }
  if (patch.phone !== undefined) clean.phone = patch.phone.trim() || null;
  if (patch.address !== undefined) clean.address = patch.address || null;
  if (patch.group !== undefined) clean.group = patch.group;
  if (patch.side !== undefined) clean.side = patch.side;
  if (patch.rsvp !== undefined) clean.rsvp = patch.rsvp;
  if (patch.pax !== undefined) clean.pax = Math.max(1, Math.min(10, Number(patch.pax)));
  if (patch.note !== undefined) clean.note = patch.note.trim() || null;
  if (patch.events !== undefined) {
    clean.events = sanitizeEvents(patch.events, (patch.side as GuestSide) ?? 'umum');
  }
  await updateDoc(doc(db, GUESTS_COLLECTION, id), clean);
}

export async function deleteGuest(id: string): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  await deleteDoc(doc(db, GUESTS_COLLECTION, id));
}

/** Terapkan hasil RSVP asli tamu ke catatan RSVP daftar tamu (by id tamu). */
export async function applyRsvpToGuest(guestId: string, attending: boolean): Promise<void> {
  if (!db) throw new Error('Firebase belum dikonfigurasi.');
  await updateDoc(doc(db, GUESTS_COLLECTION, guestId), {
    rsvp: attending ? 'hadir' : 'tidak',
    opened: true,
    updatedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// Share link
// ---------------------------------------------------------------------------

function inviteBaseUrl(side: GuestSide): string {
  const pria = ((import.meta.env.VITE_INVITE_PRIA_URL as string | undefined) ?? '').replace(/\/+$/, '');
  const wanita = ((import.meta.env.VITE_INVITE_WANITA_URL as string | undefined) ?? '').replace(/\/+$/, '');
  if (side === 'pria') return pria;
  if (side === 'wanita') return wanita;
  return pria || wanita;
}

/**
 * Link undangan personal. Format:
 *   {base}?to={Nama Tamu}&u={slug}
 * - `to` langsung dipakai cover untuk menampilkan NAMA (tanpa fetch).
 * - `u` dipakai undangan untuk verifikasi ke Firestore + menandai "sudah dibuka".
 * - `sideOverride` dipakai untuk tamu "umum" agar bisa dibuatkan link Pria & Wanita.
 */
export function buildShareLink(guest: Pick<Guest, 'name' | 'slug' | 'side'>, sideOverride?: GuestSide): string {
  const side = sideOverride ?? (guest.side === 'umum' ? 'pria' : guest.side);
  const base = inviteBaseUrl(side);
  const params = new URLSearchParams({ to: guest.name, u: guest.slug });
  return base ? `${base}?${params.toString()}` : `?${params.toString()}`;
}

export interface ShareLink {
  side: 'pria' | 'wanita';
  label: string;
  url: string;
}

/** Semua link untuk seorang tamu. Sisi "umum" dapat 2 link (Pria + Wanita). */
export function getShareLinks(guest: Pick<Guest, 'name' | 'slug' | 'side'>): ShareLink[] {
  if (guest.side === 'umum') {
    return [
      { side: 'pria', label: 'Pria', url: buildShareLink(guest, 'pria') },
      { side: 'wanita', label: 'Wanita', url: buildShareLink(guest, 'wanita') },
    ];
  }
  return [{ side: guest.side, label: guest.side === 'pria' ? 'Pria' : 'Wanita', url: buildShareLink(guest) }];
}

export function buildWaShareLink(guest: Pick<Guest, 'name' | 'slug' | 'side' | 'events'>): string {
  const links = getShareLinks(guest);
  const linkText =
    links.length > 1 ? links.map((l) => `- Undangan ${l.label}: ${l.url}`).join('\n') : links[0]!.url;
  const eventLines = guest.events.map((e) => `- ${eventLabel(e)}`).join('\n');
  const text =
    `Assalamu'alaikum Wr. Wb.\n\n` +
    `Kepada Yth. Bapak/Ibu/Saudara/i:\n*${guest.name}*\n\n` +
    `Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i ` +
    `untuk menghadiri acara pernikahan kami. Diharap kehadirannya pada:\n${eventLines}\n\n` +
    `Informasi lengkap dapat dilihat melalui tautan berikut:\n${linkText}\n\n` +
    `Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i ` +
    `berkenan hadir. Terima kasih.\n\nWassalamu'alaikum Wr. Wb.`;
  const phone = '';
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/** Parse textarea "satu nama per baris" menjadi input tamu. */
export function parseBulkNames(text: string, group: GuestGroup, side: GuestSide): GuestInput[] {
  return text
    .split('\n')
    .map((line) => line.trim().replace(/^[-*\d.)\s]+/, ''))
    .filter(Boolean)
    .map((name) => ({ name, group, side, rsvp: 'pending' as const, pax: 1 }));
}

export function guestsToCsv(guests: Guest[]): string {
  const header = 'nama,slug,grup,sisi,acara,rsvp,pax,no_hp,alamat,dibuka,link';
  const rows = guests.map((g) =>
    [g.name, g.slug, g.group, g.side, g.events.map(eventShort).join(' + '), g.rsvp, String(g.pax), g.phone ?? '', g.address ?? '', g.opened ? 'ya' : 'belum', getShareLinks(g).map((l) => l.url).join(' ')]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header, ...rows].join('\n');
}
