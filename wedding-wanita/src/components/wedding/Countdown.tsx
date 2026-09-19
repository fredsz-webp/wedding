import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/** Hitung mundur ke hari-H. Setelah lewat: tampil ucapan syukur. */
export const Countdown: React.FC<{ targetIso: string; label: string }> = ({ targetIso, label }) => {
  const target = React.useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ms = Math.max(0, target - now);
  if (ms <= 0) {
    return (
      <p className="mx-auto mt-2 max-w-[32ch] text-center font-cormorant text-[16px] italic leading-relaxed text-gold-200">
        Alhamdulillah, acara telah berlangsung dengan penuh berkah.
      </p>
    );
  }

  const units = [
    { v: Math.floor(ms / 86400000), l: 'Hari' },
    { v: Math.floor(ms / 3600000) % 24, l: 'Jam' },
    { v: Math.floor(ms / 60000) % 60, l: 'Menit' },
    { v: Math.floor(ms / 1000) % 60, l: 'Detik' },
  ];

  return (
    <div className="mt-2 text-center">
      <p className="font-cinzel text-[10.5px] font-bold uppercase tracking-[0.28em] text-gold-600">
        {label}
      </p>
      <div className="mt-3 flex items-stretch justify-center gap-2" role="timer" aria-live="off">
        {units.map((u) => (
          <div
            key={u.l}
            className="w-[62px] rounded-2xl border border-gold-400/40 bg-emerald-950/80 px-1 py-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
          >
            <motion.p
              key={u.v}
              initial={{ opacity: 0.4, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-sans text-[22px] font-bold tabular-nums leading-none text-gold-200"
            >
              {String(u.v).padStart(2, '0')}
            </motion.p>
            <p className="mt-1.5 font-cinzel text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-400">
              {u.l}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Countdown;
