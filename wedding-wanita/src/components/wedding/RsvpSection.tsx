import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Heart, Loader2, Minus, Plus, Send, X } from 'lucide-react';
import { getInstantGuestName } from '../../lib/guest';
import {
  findRsvpBySlug,
  isLiked,
  isRsvpConfigured,
  likeWish,
  MIN_FILL_SECONDS,
  setLikedId,
  submitRsvp,
  updateRsvp,
  useWishes,
  type Wish,
} from '../../lib/rsvp';

interface RsvpSectionProps {
  side: 'pria' | 'wanita';
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

/** Tombol like ucapan — 1 perangkat 1 suara, bisa unlike. */
function LikeButton({ wish }: { wish: Wish }) {
  const [liked, setLiked] = useState(() => isLiked(wish.id));
  const [count, setCount] = useState(wish.likes);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // Sinkron tampilan dengan data server + status lokal (tidak pernah me-reset paksa).
  useEffect(() => {
    setCount(wish.likes);
    setLiked(isLiked(wish.id));
  }, [wish.id, wish.likes]);

  const toggle = async () => {
    if (busyRef.current || !wish.id) return;
    // Baca status TERKINI dari guard (bukan dari state yang bisa basi),
    // dan catat SEBELUM panggil server agar echo realtime tak me-reset.
    const toLike = !isLiked(wish.id);
    busyRef.current = true;
    setBusy(true);
    setLiked(toLike);
    setLikedId(wish.id, toLike);
    setCount((c) => Math.max(0, c + (toLike ? 1 : -1)));
    try {
      await likeWish(wish.id, toLike ? 1 : -1);
    } catch {
      setLiked(!toLike);
      setLikedId(wish.id, !toLike);
      setCount(wish.likes);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={liked ? 'Batalkan suka' : 'Suka ucapan ini'}
      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 font-sans text-[11px] font-bold transition-all active:scale-95 disabled:opacity-60 ${
        liked ? 'bg-red-500 text-white shadow' : 'bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500'
      }`}
    >
      <Heart className={`h-3 w-3 ${liked ? 'fill-current' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ side }) => {
  const { instant, slug } = getInstantGuestName();
  const [name, setName] = useState(instant === 'Tamu Undangan' ? '' : instant);
  const [attending, setAttending] = useState(true);
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  /** Satu link personal hanya untuk satu kiriman — isi dari kiriman sebelumnya (kalau ada). */
  const [existing, setExisting] = useState<Wish | null>(null);
  const [checking, setChecking] = useState(Boolean(slug));
  /** Honeypot anti-bot: input tak terlihat, hanya bot yang mengisinya. */
  const [website, setWebsite] = useState('');
  const mountTime = useRef(Date.now());

  const configured = isRsvpConfigured();
  const { wishes, loading: wishesLoading } = useWishes(side);

  // Urutan: ucapan sendiri paling atas, sisanya like terbanyak dulu.
  const sortedWishes = useMemo(() => {
    const arr = [...wishes];
    arr.sort((a, b) => {
      const aOwn = slug && a.guestSlug === slug ? 0 : 1;
      const bOwn = slug && b.guestSlug === slug ? 0 : 1;
      if (aOwn !== bOwn) return aOwn - bOwn;
      if (b.likes !== a.likes) return b.likes - a.likes;
      return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
    });
    return arr;
  }, [wishes, slug]);

  // Pagination: 5 per halaman agar tidak render semua sekaligus.
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(sortedWishes.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = sortedWishes.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Saat dibuka dengan link personal, cek apakah link ini sudah dipakai mengirim.
  useEffect(() => {
    if (!slug || !configured) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    findRsvpBySlug(slug).then((found) => {
      if (cancelled) return;
      if (found) {
        // Sudah pernah kirim: tampilkan layar terkunci + ringkasan.
        // Form terisi data terakhir dan dibuka via tombol "Ubah Konfirmasi".
        setExisting(found);
        setName(found.guestName);
        setAttending(found.attending);
        setPax(Math.max(1, Math.min(10, found.pax || 1)));
        setMessage(found.message);
        setSent(true);
      }
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug, configured]);

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      // Form hanya untuk link personal — link umum read-only (daftar ucapan tetap tampil).
      if (!slug) {
        throw new Error('Gunakan link undangan personal Anda untuk mengirim konfirmasi.');
      }
      // Lapis 1 — honeypot: bot mengisi field tak terlihat → tolak diam-diam (pura-pura sukses).
      if (website.trim()) {
        setSent(true);
        return;
      }
      // Lapis 2 — time trap: manusia butuh waktu mengisi, bot submit instan.
      if (Date.now() - mountTime.current < MIN_FILL_SECONDS * 1000) {
        throw new Error('Terlalu cepat — tunggu sebentar lalu coba lagi.');
      }
      if (existing?.id) {
        await updateRsvp(existing.id, { guestName: name, attending, pax, message });
      } else {
        await submitRsvp({ guestName: name, attending, pax, message, guestSlug: slug, side });
      }
      setExisting({
        id: existing?.id ?? '',
        guestName: name,
        attending,
        pax,
        message,
        guestSlug: slug,
        side,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim. Coba lagi.');
    } finally {
      setSending(false);
    }
  };

  const sendAnother = () => {
    setSent(false);
    setMessage('');
    setError(null);
  };

  /** Batalkan edit: kembalikan isian ke data terkirim lalu tutup form. */
  const cancelEdit = () => {
    if (existing) {
      setName(existing.guestName);
      setAttending(existing.attending);
      setPax(Math.max(1, Math.min(10, existing.pax || 1)));
      setMessage(existing.message);
    }
    setError(null);
    setSent(true);
  };

  return (
    <section id="rsvp" className="relative overflow-hidden px-5 pb-16 pt-12">
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold-400/50" />
              <span className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400">
                RSVP & Wishes
              </span>
              <span className="h-px w-8 bg-gold-400/50" />
            </div>
            <h2 className="font-playfair text-[27px] font-bold leading-snug tracking-wide text-gold-200">
              Konfirmasi Kehadiran
            </h2>
            <p className="mx-auto mt-2 max-w-[34ch] font-cormorant text-[17px] italic leading-relaxed text-stone-300">
              Kabari kami apakah Anda berkenan hadir, sekaligus titipkan doa restu terbaik Anda.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5" aria-hidden>
              <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold-400/60" />
              <span className="block h-1.5 w-1.5 rotate-45 bg-gold-400/80" />
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold-400/60" />
            </div>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="parchment-card relative overflow-hidden rounded-[20px] border border-gold-400/50 p-5"
        >
          {!configured ? (
            <p className="py-6 text-center font-sans text-[14px] leading-relaxed text-stone-600">
              Konfirmasi kehadiran online belum aktif.
              <br />
              Silakan hubungi mempelai secara langsung. Terima kasih.
            </p>
          ) : checking ? (
            <div className="flex items-center justify-center gap-2 py-10 font-sans text-[14px] text-stone-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Memeriksa konfirmasi…
            </div>
          ) : !slug ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900">
                <Send className="h-6 w-6 text-gold-300" />
              </span>
              <h3 className="mt-4 font-playfair text-[20px] font-bold text-emerald-950">
                Gunakan Link Personal Anda
              </h3>
              <p className="mx-auto mt-1.5 max-w-[36ch] font-sans text-[13.5px] leading-relaxed text-stone-500">
                Konfirmasi kehadiran memerlukan link undangan personal Anda.
                Silakan hubungi mempelai untuk memintanya.
              </p>
            </div>
          ) : sent ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900">
                <Check className="h-7 w-7 text-gold-300" />
              </span>
              <h3 className="mt-4 font-playfair text-[20px] font-bold text-emerald-950">
                {attending ? 'Terima kasih atas konfirmasinya!' : 'Terima kasih atas doanya!'}
              </h3>
              <p className="mt-1.5 font-cormorant text-[15px] italic text-stone-500">
                {attending
                  ? 'Sampai jumpa di hari bahagia kami.'
                  : 'Doa restu Anda sangat berarti bagi kami.'}
              </p>
              {existing ? (
                <button
                  onClick={() => {
                    setSent(false);
                    setError(null);
                  }}
                  className="mt-4 rounded-full bg-emerald-900/10 px-5 py-2.5 font-cinzel text-[11px] font-semibold text-emerald-900 transition-all hover:bg-emerald-900/20 active:scale-[0.98]"
                >
                  Ubah Konfirmasi
                </button>
              ) : (
                <button
                  onClick={sendAnother}
                  className="mt-5 rounded-full bg-emerald-900/10 px-5 py-2.5 font-cinzel text-[11px] font-semibold text-emerald-900 transition-all hover:bg-emerald-900/20 active:scale-[0.98]"
                >
                  Kirim Ucapan Lain
                </button>
              )}
            </div>
          ) : (
            <>
              <label className="block font-sans text-[12.5px] font-bold uppercase tracking-wide text-emerald-950">
                Nama
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                maxLength={60}
                className="mt-1.5 w-full rounded-xl border border-emerald-900/20 bg-white px-4 py-3 font-sans text-[14.5px] text-stone-800 outline-none placeholder:text-stone-400 focus:border-gold-500"
              />

              {/* Honeypot anti-bot — tak terlihat manusia */}
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website"
                autoComplete="off"
                tabIndex={-1}
                aria-hidden
                className="absolute h-px w-px overflow-hidden opacity-0"
              />

              <p className="mt-4 font-sans text-[12.5px] font-bold uppercase tracking-wide text-emerald-950">
                Konfirmasi
              </p>
              <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 font-sans text-[13.5px] font-bold transition-all active:scale-[0.98] ${
                    attending
                      ? 'border-emerald-900 bg-emerald-900 text-gold-200 shadow-md'
                      : 'border-emerald-900/15 bg-white text-stone-500'
                  }`}
                >
                  <Check className="h-4 w-4" /> Hadir
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 font-sans text-[13.5px] font-bold transition-all active:scale-[0.98] ${
                    !attending
                      ? 'border-red-900 bg-red-900 text-white shadow-md'
                      : 'border-emerald-900/15 bg-white text-stone-500'
                  }`}
                >
                  <X className="h-4 w-4" /> Berhalangan
                </button>
              </div>

              {attending && (
                <div className="mt-4">
                  <p className="font-sans text-[12.5px] font-bold uppercase tracking-wide text-emerald-950">
                    Jumlah Kehadiran
                  </p>
                  <div className="mt-1.5 flex items-center justify-center gap-4 rounded-2xl border border-emerald-900/15 bg-white px-4 py-2.5">
                    <button
                      type="button"
                      aria-label="Kurangi"
                      onClick={() => setPax((v) => Math.max(1, v - 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/10 text-emerald-900 transition-all active:scale-95"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[3ch] text-center font-sans text-[17px] font-bold text-emerald-950">
                      {pax} <span className="text-[12px] font-medium text-stone-500">orang</span>
                    </span>
                    <button
                      type="button"
                      aria-label="Tambah"
                      onClick={() => setPax((v) => Math.min(10, v + 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/10 text-emerald-900 transition-all active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <label className="mt-4 block font-sans text-[12.5px] font-bold uppercase tracking-wide text-emerald-950">
                Ucapan & Doa
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis ucapan & doa restu untuk kedua mempelai…"
                rows={4}
                maxLength={500}
                className="mt-1.5 w-full resize-none rounded-xl border border-emerald-900/20 bg-white px-4 py-3 font-sans text-[14.5px] text-stone-800 outline-none placeholder:text-stone-400 focus:border-gold-500"
              />
              <p className="mt-1 text-right font-sans text-[11px] text-stone-400">{message.length}/500</p>

              {error && (
                <p className="mt-2 rounded-xl bg-red-50 p-3 font-sans text-[12.5px] font-medium text-red-700">{error}</p>
              )}

              <div className="mt-3 flex gap-2.5">
                <button
                  onClick={send}
                  disabled={sending}
                  className="btn-gold flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-cinzel text-[11.5px] font-bold uppercase tracking-wider transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin text-emerald-950" /> : <Send className="h-4 w-4 text-emerald-950" />}
                  <span>{sending ? 'Mengirim…' : existing ? 'Perbarui' : 'Kirim Konfirmasi'}</span>
                </button>
                {existing && (
                  <button
                    onClick={cancelEdit}
                    className="flex-1 rounded-2xl border border-emerald-900/20 bg-white px-4 py-3.5 font-cinzel text-[11.5px] font-bold uppercase tracking-wider text-stone-500 transition-transform active:scale-[0.98]"
                  >
                    Batal
                  </button>
                )}
              </div>
            </>
          )}

          <div className="gold-divider my-6"></div>

          {/* Daftar ucapan — mengalir ikut halaman (tanpa kotak scroll dalam) */}
          <div>
            <h4 className="text-center font-playfair text-[19px] font-bold text-emerald-950">
              Ucapan & Doa Restu
            </h4>
            {!configured || wishesLoading ? (
              <p className="mt-3 text-center font-cormorant text-[14px] italic text-stone-500">
                {configured ? 'Memuat ucapan…' : 'Belum ada ucapan.'}
              </p>
            ) : wishes.length === 0 ? (
              <p className="mt-3 text-center font-cormorant text-[14px] italic text-stone-500">
                Jadilah yang pertama mengirim ucapan.
              </p>
            ) : (
              <>
              <div className="mt-4 space-y-3">
                {pageItems.map((w) => {
                  const isOwn = Boolean(slug && w.guestSlug === slug);
                  return (
                  <div
                    key={w.id}
                    className={`relative rounded-2xl border p-3.5 pb-7 ${
                      isOwn
                        ? 'border-gold-500 bg-gold-100 shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                        : 'border-emerald-900/10 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-900 font-playfair text-[15px] font-bold capitalize text-gold-300">
                        {(w.guestName.trim()[0] ?? '?').toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-[13px] font-bold capitalize text-emerald-950">
                          {w.guestName}
                        </p>
                        <p className="font-sans text-[11px] text-stone-400">
                          {formatDate(w.createdAt)}
                          {w.attending && w.pax > 1 ? ` · ${w.pax} orang` : ''}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 font-sans text-[10.5px] font-bold ${w.attending ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-500'}`}>
                        {w.attending ? 'Hadir' : 'Berhalangan'}
                      </span>
                      {slug ? (
                        <LikeButton wish={w} />
                      ) : (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-stone-100 px-2 py-1 font-sans text-[11px] font-bold text-stone-500">
                          <Heart className="h-3 w-3" />
                          {w.likes > 0 && <span>{w.likes}</span>}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-sans text-[13px] leading-relaxed text-stone-600">{w.message}</p>
                    {isOwn && (
                      <span className="absolute bottom-1.5 right-2.5 rounded-full bg-emerald-900 px-2 py-0.5 font-sans text-[10px] font-bold text-gold-200">
                        Anda
                      </span>
                    )}
                  </div>
                  );
                })}
              </div>
              {/* Pagination */}
              {pageCount > 1 && (
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                    aria-label="Halaman sebelumnya"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/10 font-sans text-[13px] font-bold text-emerald-900 transition-all active:scale-95 disabled:opacity-30"
                  >
                    ‹
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-label={`Halaman ${p}`}
                      className={`h-8 min-w-8 rounded-full px-2 font-sans text-[12.5px] font-bold transition-all active:scale-95 ${
                        p === safePage ? 'bg-emerald-900 text-gold-200 shadow' : 'bg-emerald-900/10 text-emerald-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={safePage >= pageCount}
                    onClick={() => setPage(safePage + 1)}
                    aria-label="Halaman berikutnya"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/10 font-sans text-[13px] font-bold text-emerald-900 transition-all active:scale-95 disabled:opacity-30"
                  >
                    ›
                  </button>
                </div>
              )}
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-gold-400/40" />
            <span className="font-script text-[22px] leading-none text-gold-600/80">YF</span>
            <span className="h-px w-10 bg-gold-400/40" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RsvpSection;
