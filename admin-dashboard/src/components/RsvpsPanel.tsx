import { useMemo, useState } from 'react';
import { Heart, Link2, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react';
import { deleteRsvp, linkRsvpToGuest, type RsvpEntry } from '../lib/rsvps';
import { applyRsvpToGuest, type Guest } from '../lib/guests';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '—';
  }
}

export default function RsvpsPanel({
  entries,
  loading,
  error,
  guests,
  canDelete,
}: {
  entries: RsvpEntry[];
  loading: boolean;
  error: string | null;
  guests: Guest[];
  canDelete: boolean;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'semua' | 'hadir' | 'tidak'>('semua');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  const guestBySlug = useMemo(() => {
    const map = new Map<string, Guest>();
    guests.forEach((g) => {
      if (g.slug) map.set(g.slug, g);
    });
    return map;
  }, [guests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter === 'hadir' && !e.attending) return false;
      if (filter === 'tidak' && e.attending) return false;
      if (q && !`${e.guestName} ${e.message}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [entries, search, filter]);

  /** Terapkan RSVP terbaru per tamu (cocok via slug) ke kolom RSVP di Daftar Tamu. */
  const syncToGuests = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const latest = new Map<string, RsvpEntry>();
      entries.forEach((e) => {
        if (e.guestSlug && !latest.has(e.guestSlug)) latest.set(e.guestSlug, e);
      });
      let synced = 0;
      let skipped = 0;
      for (const [slug, entry] of latest) {
        const guest = guestBySlug.get(slug);
        if (!guest) {
          skipped++;
          continue;
        }
        const want = entry.attending ? 'hadir' : 'tidak';
        if (guest.rsvp !== want) {
          await applyRsvpToGuest(guest.id, entry.attending);
          synced++;
        }
      }
      setSyncMsg(
        synced > 0
          ? `Berhasil menerapkan ${synced} RSVP ke Daftar Tamu.${skipped > 0 ? ` ${skipped} tanpa link tamu dilewati.` : ''}`
          : 'Semua sudah sinkron, tidak ada yang perlu diubah.',
      );
    } catch (e) {
      setSyncMsg(e instanceof Error ? `Gagal: ${e.message}` : 'Gagal sinkron.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-emerald-800" />
        <h2 className="font-extrabold">RSVP & Ucapan Masuk</h2>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          {entries.length}
        </span>
      </div>
      <p className="mt-1 text-xs text-stone-500">
        Otomatis terisi saat tamu menekan “Kirim Konfirmasi” di undangan. Nama yang cocok dengan daftar tamu (via
        link personal) ditandai. Badge RSVP di tabel Daftar Tamu adalah catatan admin — tekan Sinkronkan untuk
        menerapkan data asli ke sana.
      </p>

      {canDelete && entries.length > 0 && (
        <button
          onClick={() => void syncToGuests()}
          disabled={syncing}
          className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {syncing ? 'Menyinkronkan…' : 'Sinkronkan ke Daftar Tamu'}
        </button>
      )}
      {syncMsg && <p className="mt-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800">{syncMsg}</p>}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 focus-within:border-emerald-700">
          <Search className="h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / isi ucapan…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
        </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value as 'semua' | 'hadir' | 'tidak')} className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm">
          <option value="semua">Semua</option>
          <option value="hadir">Hadir</option>
          <option value="tidak">Berhalangan</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-8 text-sm text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat RSVP…
        </div>
      ) : error ? (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">Gagal memuat: {error}</p>
      ) : filtered.length === 0 ? (
        <p className="mt-3 p-6 text-center text-sm text-stone-500">
          {entries.length === 0
            ? 'Belum ada RSVP masuk. Bagikan share link ke tamu — begitu tamu kirim konfirmasi, muncul di sini.'
            : 'Tidak ada yang cocok dengan filter.'}
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {filtered.map((e) => {
            const matched = e.guestSlug ? guestBySlug.get(e.guestSlug) : undefined;
            return (
              <div key={e.id} className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold capitalize">
                      {e.guestName}{' '}
                      <span
                        className={`ml-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          e.attending ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {e.attending ? `Hadir${e.pax > 1 ? ` · ${e.pax} org` : ''}` : 'Berhalangan'}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {formatDateTime(e.createdAt)}
                      {e.side ? ` · undangan ${e.side}` : ''}
                      {matched ? (
                        <span className="ml-1 font-bold text-emerald-700">· ✓ tamu terdaftar ({matched.group})</span>
                      ) : (
                        <span className="ml-1">· link umum / tanpa slug</span>
                      )}
                    </p>
                    {!matched && canDelete && guests.length > 0 && (
                      <label className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                        <Link2 className="h-3.5 w-3.5" />
                        {linkingId === e.id ? (
                          <span className="font-bold">Menghubungkan…</span>
                        ) : (
                          <select
                            defaultValue=""
                            onChange={(ev) => {
                              const slug = ev.target.value;
                              if (!slug) return;
                              setLinkingId(e.id);
                              linkRsvpToGuest(e.id, slug).finally(() => setLinkingId(null));
                            }}
                            className="max-w-[220px] rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-bold"
                          >
                            <option value="">Hubungkan ke tamu…</option>
                            {guests.map((g) => (
                              <option key={g.id} value={g.slug}>
                                {g.name} ({g.group})
                              </option>
                            ))}
                          </select>
                        )}
                      </label>
                    )}
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus RSVP dari "${e.guestName}"?`)) void deleteRsvp(e.id);
                      }}
                      title="Hapus"
                      className="shrink-0 rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {e.message.trim() && (
                  <p className="mt-2 rounded-lg bg-white p-2.5 text-sm leading-relaxed text-stone-600">“{e.message}”</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
