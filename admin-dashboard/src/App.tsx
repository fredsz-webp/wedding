import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  MailOpen,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  MoonStar,
  UserCheck,
  UserX,
  Users,
  Download,
  ExternalLink,
  Hourglass,
  Loader2,
  Lock,
} from 'lucide-react';
import { useAuth, type AccessLevel } from './hooks/useAuth';
import { useGuests } from './hooks/useGuests';
import { useRsvps } from './hooks/useRsvps';
// Panel tab di-load malas — bundle awal hanya berisi tab Tamu + login.
const UsersPanel = lazy(() => import('./components/UsersPanel'));
const RsvpsPanel = lazy(() => import('./components/RsvpsPanel'));
const GiftSettingsPanel = lazy(() => import('./components/GiftSettingsPanel'));
import {
  applyRsvpToGuest,
  buildShareLink,
  buildWaShareLink,
  createGuest,
  defaultEventsForSide,
  deleteGuest,
  sideFromEvents,
  EVENT_OPTIONS,
  eventShort,
  getShareLinks,
  parseBulkNames,
  updateGuest,
  GUEST_GROUPS,
  type Guest,
  type GuestEvent,
  type GuestGroup,
  type GuestInput,
  type GuestSide,
  type RsvpStatus,
} from './lib/guests';

const SIDES: { value: GuestSide | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua Sisi' },
  { value: 'pria', label: 'Pria' },
  { value: 'wanita', label: 'Wanita' },
  { value: 'umum', label: 'Umum' },
];

const RSVPS: { value: RsvpStatus | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua RSVP' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'hadir', label: 'Hadir' },
  { value: 'tidak', label: 'Berhalangan' },
];

const EVENTS: { value: GuestEvent | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua Acara' },
  ...EVENT_OPTIONS.map((e) => ({ value: e.value as GuestEvent | 'semua', label: e.short })),
];

export default function App() {
  const {
    user,
    access,
    loading: authLoading,
    error: authError,
    accessError,
    blocked,
    login,
    logout,
    refreshAccess,
  } = useAuth();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1ea]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen error={authError} onLogin={login} />;
  }

  if (blocked) {
    return (
      <DeniedScreen
        email={user.email ?? '(tanpa email)'}
        pending={access === 'pending'}
        detail={access === 'none' ? accessError : null}
        onRetry={refreshAccess}
        onLogout={logout}
      />
    );
  }

  return (
    <Dashboard
      userName={user.displayName ?? user.email ?? 'Admin'}
      userEmail={user.email}
      access={access}
      onLogout={logout}
    />
  );
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

function LoginScreen({ error, onLogin }: { error: string | null; onLogin: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-2 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-gold-400"><MoonStar className="h-7 w-7" /></span>
        </div>
        <h1 className="text-center text-2xl font-extrabold text-emerald-950">Admin Undangan</h1>
        <p className="mt-1 text-center text-sm text-stone-500">Yusuf &amp; Fara — kelola tamu &amp; share link</p>

        <div className="mt-6 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          Hanya email yang terdaftar sebagai <b>Admin/Panitia</b> di collection{' '}
          <code className="font-mono font-bold">users</code> yang bisa masuk. Minta admin mendaftarkan emailmu dulu.
        </div>

        {error && <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</div>}

        <button
          onClick={async () => {
            setBusy(true);
            await onLogin();
            setBusy(false);
          }}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
          Login dengan Google
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.5-5.35 3.5a5.9 5.9 0 1 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 1 0 12 20.9c4.5 0 8.15-3.15 8.15-7.9 0-.6-.05-1.25-.2-1.9z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Akses ditolak (login Google berhasil, tapi email belum terdaftar)
// ---------------------------------------------------------------------------

function DeniedScreen({
  email,
  pending,
  detail,
  onRetry,
  onLogout,
}: {
  email: string;
  pending: boolean;
  detail: string | null;
  onRetry: () => void;
  onLogout: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-2 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            {pending ? <Hourglass className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-emerald-950">
          {pending ? 'Menunggu Persetujuan' : 'Akses Ditolak'}
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          Email <b className="break-all">{email}</b>{' '}
          {pending ? (
            <>
              sudah tercatat di Firestore dengan status <b>Menunggu</b>.
            </>
          ) : (
            <>belum terdaftar dan pendaftaran otomatis gagal.</>
          )}
        </p>
        <p className="mt-1 text-xs text-stone-400">
          {pending ? (
            <>
              Kalau ini akun pertamamu (pemilik undangan): buka Firebase Console → Firestore → collection{' '}
              <code className="font-mono">users</code> → ubah field <code className="font-mono">role</code> dokumen ini
              menjadi <code className="font-mono">admin</code>, lalu tekan Coba Lagi. Akun berikutnya bisa di-approve
              dari menu Kelola Pengguna.
            </>
          ) : (
            <>
              Pastikan Rules terbaru sudah di-Publish (izinkan daftar mandiri) lalu login ulang, atau minta admin
              mendaftarkan email ini.
            </>
          )}
        </p>
        {!pending && detail && (
          <p className="mt-2 break-all rounded-xl bg-red-50 p-2.5 font-mono text-[11px] text-red-700">
            {detail.toLowerCase().includes('permission') || detail.toLowerCase().includes('insufficient')
              ? 'Firestore menolak akses (permission-denied). 99% karena Rules terbaru BELUM di-Publish — cek tab Rules di Console.'
              : detail}
          </p>
        )}
        <button
          onClick={async () => {
            setBusy(true);
            await onRetry();
            setBusy(false);
          }}
          disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-5 w-5 animate-spin" />} Coba Lagi
        </button>
        <button onClick={onLogout} className="mt-2 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50">
          Keluar
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function Dashboard({
  userName,
  userEmail,
  access,
  onLogout,
}: {
  userName: string;
  userEmail: string | null;
  access: AccessLevel;
  onLogout: () => void;
}) {
  const { guests, loading, error, stats } = useGuests();
  const { entries: rsvps, loading: rsvpsLoading, error: rsvpsError, stats: rsvpStats } = useRsvps();

  // Sinkron otomatis: RSVP terbaru tiap tamu (masuk via link personal) langsung
  // diterapkan ke kolom RSVP di Daftar Tamu — tanpa perlu tekan tombol apa pun.
  // Hanya menulis yang beda, jadi tidak ada loop tulis Firestore.
  const autoSyncBusy = useRef(false);
  useEffect(() => {
    if (autoSyncBusy.current || guests.length === 0 || rsvps.length === 0) return;
    const guestBySlug = new Map(guests.map((g) => [g.slug, g]));
    // entries terurut terbaru dulu → ambil 1 (terbaru) per slug.
    const latest = new Map<string, (typeof rsvps)[number]>();
    rsvps.forEach((e) => {
      if (e.guestSlug && !latest.has(e.guestSlug)) latest.set(e.guestSlug, e);
    });
    const jobs: Promise<unknown>[] = [];
    for (const [slug, entry] of latest) {
      const guest = guestBySlug.get(slug);
      if (!guest) continue;
      const want = entry.attending ? 'hadir' : 'tidak';
      if (guest.rsvp !== want) jobs.push(applyRsvpToGuest(guest.id, entry.attending));
    }
    if (jobs.length === 0) return;
    autoSyncBusy.current = true;
    void Promise.allSettled(jobs).finally(() => {
      autoSyncBusy.current = false;
    });
  }, [rsvps, guests]);
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<GuestSide | 'semua'>('semua');
  const [groupFilter, setGroupFilter] = useState<GuestGroup | 'semua'>('semua');
  const [rsvpFilter, setRsvpFilter] = useState<RsvpStatus | 'semua'>('semua');
  const [eventFilter, setEventFilter] = useState<GuestEvent | 'semua'>('semua');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tab, setTab] = useState<'tamu' | 'rsvp' | 'pengguna' | 'gift'>('tamu');

  /** Panitia: kelola tamu saja. Hapus tamu + kelola pengguna khusus admin. */
  const canManageUsers = access === 'admin';
  const canDeleteGuests = canManageUsers;
  const roleLabel = access === 'admin' ? 'Admin' : 'Panitia';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      if (sideFilter !== 'semua' && g.side !== sideFilter) return false;
      if (groupFilter !== 'semua' && g.group !== groupFilter) return false;
      if (rsvpFilter !== 'semua' && g.rsvp !== rsvpFilter) return false;
      if (eventFilter !== 'semua' && !g.events.includes(eventFilter)) return false;
      if (q && !`${g.name} ${g.phone ?? ''} ${g.address ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [guests, search, sideFilter, groupFilter, rsvpFilter, eventFilter]);

  // Estimasi orang per tamu dari RSVP terbaru (hanya yang hadir) — tampil di tabel Daftar Tamu.
  const estimasiBySlug = useMemo(() => {
    const map = new Map<string, number>();
    const seen = new Set<string>();
    rsvps.forEach((e) => {
      if (!e.guestSlug || seen.has(e.guestSlug)) return;
      seen.add(e.guestSlug);
      if (e.attending) map.set(e.guestSlug, e.pax);
    });
    return map;
  }, [rsvps]);

  const copyLink = async (g: Guest, side?: GuestSide) => {
    const key = side ? `${g.id}-${side}` : g.id;
    const url = side ? buildShareLink(g, side) : buildShareLink(g);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(key);
      setTimeout(() => setCopiedId((v) => (v === key ? null : v)), 1800);
    } catch {
      window.prompt('Salin link berikut:', url);
    }
  };

  const exportXlsx = async () => {
    // Library xlsx di-load malas — hanya diunduh saat tombol export diklik.
    const XLSX = await import('xlsx');
    const thinBorder = { style: 'thin', color: { rgb: 'FFC9C2B4' } };
    const border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
    const header = ['Nama', 'Grup', 'Sisi', 'Acara', 'RSVP', 'Estimasi Orang', 'No. HP', 'Alamat', 'Dibuka', 'Link'];
    // Pax diambil dari RSVP yang dikirim tamu (bukan estimasi admin):
    // hadir → jumlah pax, berhalangan → 0, belum isi → kosong.
    const rsvpBySlug = new Map(rsvps.map((e) => [e.guestSlug, e]));
    const estimasiOrang = (slug: string): string | number => {
      const e = rsvpBySlug.get(slug);
      if (!e) return '';
      return e.attending ? e.pax : 0;
    };
    const body: (string | number)[][] = filtered.map((g) => [
      g.name,
      g.group,
      g.side,
      g.events.map(eventShort).join(' + '),
      g.rsvp,
      estimasiOrang(g.slug),
      g.phone ?? '',
      g.address ?? '',
      g.opened ? 'Sudah buka' : 'Belum',
      getShareLinks(g).map((l) => l.url).join('\n'),
    ]);
    // Baris TOTAL di bawah: jumlahkan Estimasi Orang (yang hadir saja).
    const totalOrang = filtered.reduce((sum, g) => {
      const v = estimasiOrang(g.slug);
      return sum + (typeof v === 'number' ? v : 0);
    }, 0);
    const totalRow: (string | number)[] = ['', '', '', '', 'TOTAL', totalOrang, '', '', '', ''];
    const ws = XLSX.utils.aoa_to_sheet([header, ...body, totalRow]);
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
    for (let r = range.s.r; r <= range.e.r; r++) {
      // Baris terakhir = TOTAL.
      const isTotal = r === range.e.r;
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (!cell) continue;
        cell.s =
          r === 0
            ? {
                font: { bold: true, color: { rgb: 'FFFFFFFF' } },
                fill: { fgColor: { rgb: 'FF0E3122' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border,
              }
            : {
                alignment: { vertical: 'center', wrapText: c === 9 },
                border,
                ...(isTotal ? { font: { bold: true }, fill: { fgColor: { rgb: 'FFF4EDE2' } } } : {}),
              };
      }
    }
    // Kolom No. HP diformat teks agar nol depan (08…) tidak dimakan Excel.
    for (let r = 1; r <= range.e.r; r++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c: 6 })];
      if (cell) cell.z = '@';
    }
    ws['!cols'] = [
      { wch: 24 },
      { wch: 12 },
      { wch: 9 },
      { wch: 24 },
      { wch: 9 },
      { wch: 15 },
      { wch: 16 },
      { wch: 28 },
      { wch: 11 },
      { wch: 50 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Tamu');
    XLSX.writeFile(wb, 'daftar-tamu.xlsx');
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-stone-800">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-emerald-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 text-emerald-950"><MoonStar className="h-5 w-5" /></span>
            <div>
              <p className="font-extrabold leading-tight">Admin Undangan</p>
              <p className="text-xs text-emerald-100/70">Yusuf &amp; Fara · {stats.total} tamu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">
                {userName}{' '}
                <span className="ml-1 rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-bold text-emerald-950">
                  {roleLabel}
                </span>
              </p>
              <p className="text-xs text-emerald-100/70">{userEmail}</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Keluar dari dashboard admin?')) onLogout();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Stats — tamu dari Firestore, RSVP dari konfirmasi asli tamu */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <Stat icon={<Users className="h-5 w-5" />} label="Total Tamu" value={stats.total} tone="bg-emerald-900" />
          <Stat icon={<MailOpen className="h-5 w-5" />} label="Sudah Buka" value={stats.opened} tone="bg-sky-700" />
          <Stat icon={<UserCheck className="h-5 w-5" />} label="RSVP Hadir" value={rsvpStats.hadir} tone="bg-green-700" />
          <Stat icon={<UserX className="h-5 w-5" />} label="Berhalangan" value={rsvpStats.tidak} tone="bg-red-700" />
          <Stat icon={<MessageCircle className="h-5 w-5" />} label="Ucapan" value={rsvpStats.ucapan} tone="bg-amber-600" />
          <Stat icon={<Check className="h-5 w-5" />} label="Estimasi Orang" value={rsvpStats.paxHadir} tone="bg-emerald-700" />
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setTab('tamu')}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold ${tab === 'tamu' ? 'bg-emerald-900 text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
          >
            Daftar Tamu
          </button>
          <button
            onClick={() => setTab('rsvp')}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold ${tab === 'rsvp' ? 'bg-emerald-900 text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
          >
            RSVP & Ucapan{rsvpStats.total > 0 ? ` (${rsvpStats.total})` : ''}
          </button>
          {canManageUsers && (
            <button
              onClick={() => setTab('pengguna')}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold ${tab === 'pengguna' ? 'bg-emerald-900 text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
            >
              Kelola Pengguna
            </button>
          )}
          {canManageUsers && (
            <button
              onClick={() => setTab('gift')}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold ${tab === 'gift' ? 'bg-emerald-900 text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
            >
              Gift
            </button>
          )}
        </div>

        <Suspense fallback={<p className="mt-6 text-center text-sm text-stone-400">Memuat…</p>}>
        {tab === 'pengguna' && canManageUsers ? (
          <UsersPanel currentEmail={userEmail ?? ''} />
        ) : tab === 'gift' && canManageUsers ? (
          <GiftSettingsPanel />
        ) : tab === 'rsvp' ? (
          <RsvpsPanel
            entries={rsvps}
            loading={rsvpsLoading}
            error={rsvpsError}
            guests={guests}
            canDelete={canDeleteGuests}
          />
        ) : (
          <>
        {/* Toolbar */}
        <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 focus-within:border-emerald-700">
              <Search className="h-4 w-4 text-stone-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / no HP / alamat…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <select value={sideFilter} onChange={(e) => setSideFilter(e.target.value as GuestSide | 'semua')} className="rounded-xl border border-stone-200 px-2 py-2.5 text-sm">
                {SIDES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value as GuestGroup | 'semua')} className="rounded-xl border border-stone-200 px-2 py-2.5 text-sm">
                <option value="semua">Semua Grup</option>
                {GUEST_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select value={rsvpFilter} onChange={(e) => setRsvpFilter(e.target.value as RsvpStatus | 'semua')} className="rounded-xl border border-stone-200 px-2 py-2.5 text-sm">
                {RSVPS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value as GuestEvent | 'semua')} className="rounded-xl border border-stone-200 px-2 py-2.5 text-sm">
                {EVENTS.map((ev) => (
                  <option key={ev.value} value={ev.value}>{ev.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" /> Tambah Tamu
            </button>
            <button
              onClick={() => setShowBulk(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-900/20 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-900 hover:bg-emerald-100"
            >
              <Upload className="h-4 w-4" /> Tambah Banyak
            </button>
            <button
              onClick={() => void exportXlsx()}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40"
            >
              <Download className="h-4 w-4" /> Export Excel ({filtered.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-stone-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Memuat data tamu…
            </div>
          ) : error ? (
            <div className="p-6 text-sm">
              <p className="font-bold text-red-700">Gagal memuat data: {error}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-stone-600">
                <li>Pastikan file <code className="font-mono">.env</code> sudah diisi (lihat <code className="font-mono">.env.example</code>).</li>
                <li>Aktifkan <b>Authentication → Sign-in method → Google</b> di Firebase Console.</li>
                <li>Buat database <b>Firestore</b> dan pasang rules (lihat README).</li>
              </ol>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-stone-500">
              {guests.length === 0 ? (
                <>
                  <p className="text-lg font-bold text-stone-700">Belum ada data tamu</p>
                  <p className="mt-1">Klik “Tambah Tamu” atau “Tambah Banyak” untuk mulai mengisi daftar undangan.</p>
                </>
              ) : (
                'Tidak ada tamu yang cocok dengan filter.'
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                    <th className="px-4 py-3">Nama Tamu</th>
                    <th className="px-4 py-3">Grup / Sisi</th>
                    <th className="px-4 py-3">Acara</th>
                    <th className="px-4 py-3">RSVP</th>
                    <th className="px-4 py-3">Dibuka</th>
                    <th className="px-4 py-3">Share Link</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g) => (
                    <tr key={g.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/60">
                      <td className="px-4 py-3">
                        <p className="font-bold capitalize">{g.name}</p>
                        <p className="text-xs text-stone-500">
                          {[g.phone, g.address].filter(Boolean).join(' · ') || '—'}
                          {estimasiBySlug.has(g.slug) && (
                            <span className="font-bold text-emerald-700">{` · ${estimasiBySlug.get(g.slug)} orang`}</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="mr-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">{g.group}</span>
                        <span className="inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-600">{g.side}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {g.events.map((ev) => (
                            <span key={ev} title={EVENT_OPTIONS.find((o) => o.value === ev)?.label} className="inline-block rounded-full bg-gold-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                              {eventShort(ev)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RsvpBadge value={g.rsvp} />
                      </td>
                      <td className="px-4 py-3">
                        {g.opened ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700">
                            <Eye className="h-3.5 w-3.5" /> Ya{g.viewCount > 1 ? ` (${g.viewCount}×)` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400">
                            <EyeOff className="h-3.5 w-3.5" /> Belum
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getShareLinks(g).map((l) => {
                            const key = g.side === 'umum' ? `${g.id}-${l.side}` : g.id;
                            const copied = copiedId === key;
                            return (
                              <button
                                key={l.side}
                                onClick={() => void copyLink(g, g.side === 'umum' ? l.side : undefined)}
                                title={`Salin share link ${l.label}`}
                                className="flex items-center gap-1 rounded-lg bg-emerald-900 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                              >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? 'Tersalin!' : g.side === 'umum' ? `Salin ${l.label}` : 'Salin Link'}
                              </button>
                            );
                          })}
                          <a
                            href={buildWaShareLink(g)}
                            target="_blank"
                            rel="noreferrer"
                            title="Kirim via WhatsApp"
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-green-500"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> WA
                          </a>
                          {getShareLinks(g).map((l) => (
                            <a
                              key={l.side}
                              href={l.url}
                              target="_blank"
                              rel="noreferrer"
                              title={`Buka undangan ${l.label} sebagai tamu ini`}
                              className="rounded-lg border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-100"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ))}
                        </div>
                        {getShareLinks(g).map((l) => (
                          <p key={l.side} className="mt-1 max-w-[280px] truncate font-mono text-[11px] text-stone-400">
                            {g.side === 'umum' && <span className="font-bold">[{l.label}] </span>}{l.url}
                          </p>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <RsvpQuickButton guest={g} value="hadir" />
                          <RsvpQuickButton guest={g} value="tidak" />
                          <button
                            onClick={() => {
                              setEditing(g);
                              setShowForm(true);
                            }}
                            title="Edit"
                            className="rounded-lg border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {canDeleteGuests && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus "${g.name}" dari daftar tamu?`)) void deleteGuest(g.id);
                              }}
                              title="Hapus"
                              className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-stone-400">
          Share link format: <code className="font-mono">?u=slug</code> — nama langsung tampil di cover,{' '}
          <code className="font-mono">u</code> menandai status “Sudah Buka” otomatis.
          Tamu sisi <b>Pria</b>/<b>Wanita</b> dapat 1 link subdomain; <b>Umum</b> dapat 2 link subdomain (langsung, tanpa pilih sisi).
        </p>
          </>
        )}
        </Suspense>
      </main>

      {showForm && (
        <GuestFormModal
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
      {showBulk && <BulkModal onClose={() => setShowBulk(false)} />}
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${tone}`}>{icon}</span>
      <div>
        <p className="text-xl font-extrabold leading-none">{value}</p>
        <p className="mt-1 text-xs text-stone-500">{label}</p>
      </div>
    </div>
  );
}

function RsvpBadge({ value }: { value: RsvpStatus }) {
  if (value === 'hadir') return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">Hadir</span>;
  if (value === 'tidak') return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">Berhalangan</span>;
  return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">Menunggu</span>;
}

function RsvpQuickButton({ guest, value }: { guest: Guest; value: RsvpStatus }) {
  const active = guest.rsvp === value;
  return (
    <button
      onClick={() => void updateGuest(guest.id, { rsvp: value })}
      title={value === 'hadir' ? 'Tandai hadir' : 'Tandai berhalangan'}
      className={`rounded-lg border p-1.5 ${
        active
          ? value === 'hadir'
            ? 'border-green-600 bg-green-600 text-white'
            : 'border-red-600 bg-red-600 text-white'
          : 'border-stone-200 text-stone-400 hover:bg-stone-100'
      }`}
    >
      {value === 'hadir' ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Form tambah / edit
// ---------------------------------------------------------------------------

function GuestFormModal({ initial, onClose }: { initial: Guest | null; onClose: () => void }) {
  const [form, setForm] = useState<GuestInput>({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    address: initial?.address ?? '',
    group: initial?.group ?? 'Keluarga',
    side: initial?.side ?? 'umum',
    rsvp: initial?.rsvp ?? 'pending',
    pax: initial?.pax ?? 1,
    note: initial?.note ?? '',
    events: initial?.events ?? defaultEventsForSide(initial?.side ?? 'umum'),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<GuestInput>) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.name.trim()) {
      setError('Nama tamu wajib diisi.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (initial) await updateGuest(initial.id, form);
      else await createGuest(form);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? 'Edit Tamu' : 'Tambah Tamu'} onClose={onClose}>
      <label className="block text-sm font-bold">Nama Tamu *</label>
      <input
        value={form.name}
        onChange={(e) => set({ name: e.target.value })}
        placeholder="cth: Bpk. H. Ahmad & Keluarga"
        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
      />
      <p className="mt-1 text-xs text-stone-400">Nama ini yang muncul di cover: “Kepada Yth… {form.name || '…'}”.</p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-bold">Grup</label>
          <select value={form.group} onChange={(e) => set({ group: e.target.value as GuestGroup })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm">
            {GUEST_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold">Sisi Undangan</label>
          <select
            value={form.side}
            onChange={(e) => {
              const side = e.target.value as GuestSide;
              set({ side, events: defaultEventsForSide(side) });
            }}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
          >
            <option value="pria">Pria</option>
            <option value="wanita">Wanita</option>
            <option value="umum">Umum (2 link: pria + wanita)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold">No. HP (opsional)</label>
          <input value={form.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} placeholder="08…" className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" />
        </div>
      </div>

      <label className="mt-3 block text-sm font-bold">Alamat / Keterangan (opsional)</label>
      <input value={form.address ?? ''} onChange={(e) => set({ address: e.target.value })} placeholder="cth: Ds. Tempel RT 02" className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700" />

      <div className="mt-3">
        <label className="block text-sm font-bold">Diundang pada acara *</label>
        <div className="mt-1 rounded-xl border border-stone-200 px-3 py-1.5">
          {EVENT_OPTIONS.map((ev) => {
            const checked = (form.events ?? []).includes(ev.value);
            return (
              <label
                key={ev.value}
                onClick={(e) => {
                  e.preventDefault();
                  const cur = form.events ?? [];
                  const next = checked ? cur.filter((v) => v !== ev.value) : [...cur, ev.value];
                  set({ events: next, side: sideFromEvents(next) });
                }}
                className="flex cursor-pointer items-start gap-2 py-1.5"
              >
                <span
                  className={`mt-[3px] flex h-[13px] w-[13px] shrink-0 items-center justify-center border-[1.5px] ${
                    checked ? 'border-emerald-900 bg-emerald-900' : 'border-stone-500 bg-white'
                  }`}
                >
                  {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />}
                </span>
                <span>
                  <span className="block font-serif text-[13px] leading-snug text-stone-800">{ev.card}</span>
                  {ev.sub && <span className="block font-serif text-[12px] text-stone-500">{ev.sub}</span>}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {error && <p className="mt-3 rounded-xl bg-red-50 p-2.5 text-xs text-red-700">{error}</p>}

      <div className="mt-5 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50">
          Batal
        </button>
        <button onClick={() => void save()} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {initial ? 'Simpan' : 'Tambah'}
        </button>
      </div>

      {initial && (
        <div className="mt-3 space-y-1 break-all rounded-xl bg-stone-50 p-2.5 font-mono text-[11px] text-stone-500">
          {getShareLinks({ name: form.name || initial.name, slug: initial.slug, side: form.side ?? initial.side }).map((l) => (
            <p key={l.side}>
              {l.label}: {l.url}
            </p>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Bulk tambah
// ---------------------------------------------------------------------------

function BulkModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  const [group, setGroup] = useState<GuestGroup>('Keluarga');
  const [side, setSide] = useState<GuestSide>('umum');
  const [events, setEvents] = useState<GuestEvent[]>(() => defaultEventsForSide('umum'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const dayOptions = EVENT_OPTIONS.filter((ev) => {
    if (side === 'pria') return ev.value.startsWith('pria-');
    if (side === 'wanita') return ev.value.startsWith('wanita-');
    return true;
  });
  const showDayPicker = dayOptions.length > 1;

  const preview = parseBulkNames(text, group, side, events);

  const save = async () => {
    if (preview.length === 0) {
      setError('Isi minimal 1 nama (satu nama per baris).');
      return;
    }
    if (events.length === 0) {
      setError('Pilih minimal 1 hari acara.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      for (const g of preview) await createGuest(g);
      setDone(preview.length);
      setText('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Tambah Banyak Tamu" onClose={onClose}>
      <p className="text-xs text-stone-500">Tulis satu nama per baris. Contoh:</p>
      <pre className="mt-1 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-600">Bpk. H. Ahmad &amp; Keluarga{'\n'}Ibu Siti Aminah{'\n'}Mas Bagus + Mbak Rina</pre>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Satu nama per baris…"
        className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"
      />
      <div className="mt-2 grid grid-cols-2 gap-3">
        <select value={group} onChange={(e) => setGroup(e.target.value as GuestGroup)} className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm">
          {GUEST_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select
          value={side}
          onChange={(e) => {
            const next = e.target.value as GuestSide;
            setSide(next);
            setEvents(defaultEventsForSide(next));
          }}
          className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm"
        >
          <option value="pria">Pria</option>
          <option value="wanita">Wanita</option>
          <option value="umum">Umum (2 link: pria + wanita)</option>
        </select>
      </div>

      {showDayPicker && (
        <div className="mt-3">
          <label className="block text-sm font-bold">Diundang pada hari *</label>
          <div className="mt-1 rounded-xl border border-stone-200 px-3 py-1.5">
            {dayOptions.map((ev) => {
              const checked = events.includes(ev.value);
              return (
                <label
                  key={ev.value}
                  onClick={(e) => {
                    e.preventDefault();
                    const next = checked ? events.filter((v) => v !== ev.value) : [...events, ev.value];
                    setEvents(next);
                    if (next.length > 0) setSide(sideFromEvents(next));
                  }}
                  className="flex cursor-pointer items-start gap-2 py-1.5"
                >
                  <span
                    className={`mt-[3px] flex h-[13px] w-[13px] shrink-0 items-center justify-center border-[1.5px] ${
                      checked ? 'border-emerald-900 bg-emerald-900' : 'border-stone-500 bg-white'
                    }`}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={4} />}
                  </span>
                  <span>
                    <span className="block font-serif text-[13px] leading-snug text-stone-800">{ev.card}</span>
                    {ev.sub && <span className="block font-serif text-[12px] text-stone-500">{ev.sub}</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <p className="mt-2 text-xs text-stone-500">
        Terdeteksi: <b>{preview.length}</b> nama
        {events.length > 0 && (
          <> · Acara: <b>{events.map(eventShort).join(', ')}</b></>
        )}
      </p>
      {done !== null && <p className="mt-2 rounded-xl bg-green-50 p-2.5 text-xs font-bold text-green-700">Berhasil menambah {done} tamu.</p>}
      {error && <p className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50">Tutup</button>
        <button onClick={() => void save()} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Simpan {preview.length} Tamu
        </button>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-xl leading-none text-stone-400 hover:bg-stone-100">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
