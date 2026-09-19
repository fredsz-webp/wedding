import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Heart, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import { PRIA_URL, WANITA_URL, withForwardedQuery } from './config';

/** Ambil nama tamu: ?to= dulu, kalau tidak ada turunkan dari ?u=slug. */
function useGuestName(): string | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('to');
  if (raw && raw.trim()) return raw.trim();
  const slug = (params.get('u') || '').trim().toLowerCase();
  if (!slug) return null;
  const base = slug.replace(/-[a-z0-9]{1,4}$/, '');
  if (!base || base === 'tamu') return null;
  return base
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function PortalCard({
  badge,
  icon,
  title,
  name,
  dates,
  place,
  href,
  primary,
  delay,
}: {
  badge: string;
  icon: React.ReactNode;
  title: string;
  name: string;
  dates: string[];
  place: string;
  href: string;
  primary?: boolean;
  delay: number;
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className={`emerald-card group relative flex flex-col overflow-hidden rounded-3xl p-8 text-center sm:p-10 ${
        primary ? 'ring-1 ring-gold-500/50' : ''
      }`}
    >
      <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/40 bg-emerald-900 text-gold-400">
        {icon}
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400">{badge}</p>
      <h2 className="mt-2 font-cinzel text-xl font-bold text-white sm:text-2xl">{title}</h2>
      <p className="mt-1 font-script text-3xl text-gold-gradient sm:text-4xl">{name}</p>
      <div className="gold-divider my-5" />
      <div className="flex flex-col items-center gap-1.5">
        {dates.map((d) => (
          <p key={d} className="flex items-center justify-center gap-2 text-sm text-emerald-100/90">
            <CalendarDays className="h-4 w-4 shrink-0 text-gold-400" /> {d}
          </p>
        ))}
      </div>
      <p className="mt-1.5 flex items-center justify-center gap-2 text-sm text-emerald-100/70">
        <MapPin className="h-4 w-4 text-gold-400" /> {place}
      </p>
      <span
        className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ${
          primary ? 'btn-gold' : 'btn-emerald'
        }`}
      >
        Buka Undangan <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </motion.a>
  );
}

export function App() {
  // Nama instan (?to= / turunan slug) jadi cadangan offline;
  // bila link membawa ?u=, badge tampil loading dulu sampai nama resmi ketemu.
  const derived = useGuestName();
  const slugParam = new URLSearchParams(window.location.search).get('u')?.trim() || null;
  const [officialName, setOfficialName] = useState<string | null>(null);
  const [slugInvalid, setSlugInvalid] = useState(false);
  const [verifying, setVerifying] = useState(Boolean(slugParam));
  // Splash: min. tampil 900ms agar tidak kedip, lalu fade-out.
  const splashStart = useRef(Date.now());
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('u')?.trim();
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        // Import malas: firebase hanya diunduh bila link membawa ?u=.
        const { getApp, loadDb } = await import('./lib/firebase');
        const app = getApp();
        if (!app || cancelled) {
          if (!cancelled) setVerifying(false);
          return;
        }
        const db = await loadDb(app);
        const { collection, getDocs, limit, query, where } = await import('firebase/firestore');
        const snap = await getDocs(
          query(collection(db, 'guests'), where('slug', '==', slug), limit(1)),
        );
        if (cancelled) return;
        if (snap.empty) {
          setSlugInvalid(true);
        } else {
          const name = String(snap.docs[0]!.data().name ?? '').trim();
          if (name) setOfficialName(name);
        }
      } catch {
        /* offline / belum konfigurasi — jatuh ke nama turunan */
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const guest = slugInvalid ? null : (officialName ?? derived);

  // Splash hilang (fade) setelah verifikasi selesai + min. durasi tercapai.
  useEffect(() => {
    if (!slugParam || verifying || splashGone) return;
    const wait = Math.max(0, 900 - (Date.now() - splashStart.current));
    const t = window.setTimeout(() => setSplashGone(true), wait);
    return () => window.clearTimeout(t);
  }, [slugParam, verifying, splashGone]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-emerald-950 px-5 py-14 font-sans">
      {/* Splash verifikasi tamu */}
      {slugParam && !splashGone && (
        <div
          aria-hidden={!verifying}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950 transition-opacity duration-500 ${
            verifying ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-gold-500/40 bg-emerald-900">
            <span className="font-script text-3xl text-gold-gradient">YF</span>
          </span>
          <p className="mt-2 font-playfair text-2xl font-bold text-white">
            Yusuf <span className="font-script font-normal text-gold-gradient">&amp;</span> Fara
          </p>
        </div>
      )}
      {/* Ornamen latar */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(rgba(212,175,55,0.5) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-4xl text-center"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-300/90">
          Undangan Pernikahan
        </p>
        <h1 className="mt-4 font-playfair text-4xl font-bold leading-tight sm:text-6xl">
          <span className="text-gold-gradient">Yusuf</span>{' '}
          <span className="font-script font-normal text-gold-gradient">&amp;</span>{' '}
          <span className="text-gold-gradient">Fara</span>
        </h1>
        <p className="mt-3 text-sm tracking-wide text-emerald-100/80 sm:text-base">
          3, 4 &amp; 11 Oktober 2026 – Kabupaten Semarang
        </p>

        {guest && (
          <p className="mx-auto mt-6 inline-block rounded-full border border-gold-500/40 bg-emerald-900/80 px-6 py-2.5 text-sm text-white">
            Kepada Yth: <span className="font-semibold text-gold-300">{guest}</span>
          </p>
        )}

        <div className="gold-divider mx-auto my-8 max-w-xs" />
      </motion.div>

      <div className="relative mt-10 grid w-full max-w-4xl gap-5 sm:grid-cols-2">
        <PortalCard
          badge="Undangan Pihak"
          icon={<Heart className="h-7 w-7" />}
          title="Mempelai Wanita"
          name="Fara"
          dates={['Sabtu, 3 Oktober 2026, 08.00 – 19.00', 'Minggu, 4 Oktober 2026, 08.00 – 12.00']}
          place="Tempel, Plumbon, Suruh"
          href={withForwardedQuery(WANITA_URL)}
          primary
          delay={0.15}
        />
        <PortalCard
          badge="Undangan Pihak"
          icon={<Crown className="h-7 w-7" />}
          title="Mempelai Pria"
          name="Yusuf"
          dates={['Minggu, 11 Oktober 2026', 'Pukul 13.00 – 20.00 WIB']}
          place="Singkil, Karanggondang, Pabelan"
          href={withForwardedQuery(PRIA_URL)}
          delay={0.28}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative mt-10 px-4 text-center text-xs leading-relaxed tracking-wide text-emerald-100/50"
      >
        Khoyrul Yusuf Maulana &amp; Aprilia Faragita, terima kasih atas doa &amp; kehadiran Anda
      </motion.p>
    </div>
  );
}

export default App;
