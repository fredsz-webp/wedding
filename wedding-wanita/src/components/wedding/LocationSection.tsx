import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Copy, Check, ExternalLink, ZoomIn, X } from 'lucide-react';
import Countdown from './Countdown';

const routes = [
  { step: '1', title: 'Exit Toll Salatiga', desc: 'Keluar gerbang tol menuju arah Suruh' },
  { step: '2', title: 'Jl. Salatiga - Suruh', desc: 'Lurus melintasi kawasan Tegal Waton' },
  { step: '3', title: 'Nyamat & Karanglo', desc: 'Melewati Jembatan Karanglo' },
  { step: '4', title: 'Dusun Tempel', desc: 'Tiba di lokasi acara (Plumbon)' },
];

export const LocationSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const addressText = 'Dusun Tempel, RT.25/RW.06, Plumbon, Kec. Suruh, Kab. Semarang, Jawa Tengah';
  const mapsUrl = 'https://maps.app.goo.gl/K5a9sDrD8DjxG3V76';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mapsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="lokasi" className="relative overflow-hidden px-5 pb-16 pt-12">
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
                Location & Map
              </span>
              <span className="h-px w-8 bg-gold-400/50" />
            </div>
            <h2 className="font-playfair text-[27px] font-bold leading-snug tracking-wide text-gold-200">
              Denah & Peta Lokasi
            </h2>
            <p className="mx-auto mt-2 max-w-[34ch] font-cormorant text-[17px] italic leading-relaxed text-stone-300">
              Kehadiran dan doa restu Anda merupakan kehormatan dan kebahagiaan terbesar bagi kami.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5" aria-hidden>
              <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold-400/60" />
              <span className="block h-1.5 w-1.5 rotate-45 bg-gold-400/80" />
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold-400/60" />
            </div>
          </motion.div>
        </div>

        {/* Kartu lokasi */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="parchment-card relative overflow-hidden rounded-[20px] border border-gold-400/50 p-5"
        >
          {/* Alamat */}
          <div className="mx-auto mb-2 max-w-[30ch] text-center">
            <h3 className="mb-1.5 font-playfair text-[22px] font-bold leading-snug text-emerald-950">
              Kediaman Mempelai
            </h3>
            <p className="font-sans text-[14.5px] font-medium leading-relaxed text-stone-600">
              {addressText}
            </p>

            {/* Tombol aksi — tumpuk penuh */}
            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-cinzel text-[11.5px] font-bold uppercase tracking-wider transition-transform active:scale-[0.98]"
              >
                <Navigation className="h-4 w-4 text-emerald-950" />
                <span>Petunjuk Arah Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5 text-emerald-950 opacity-70" />
              </a>

              <button
                onClick={handleCopyAddress}
                className="btn-emerald flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-cinzel text-[11.5px] font-bold uppercase tracking-wider transition-transform active:scale-[0.98]"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gold-300" />}
                <span>{copied ? 'Alamat Tersalin!' : 'Salin Alamat'}</span>
              </button>
            </div>
          </div>

          <div className="gold-divider my-6"></div>

          {/* Denah */}
          <div>
            <div className="mb-3">
              <div>
                <h4 className="font-playfair text-[18px] font-bold leading-snug text-emerald-950">
                  Denah Rute Perjalanan
                </h4>
                <p className="font-cormorant text-[13.5px] italic text-stone-500">
                  Panduan rute dari Exit Tol Salatiga menuju lokasi acara
                </p>
              </div>
            </div>

            <div
              onClick={() => setIsZoomed(true)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-900/20 bg-cream-300 transition-all hover:border-gold-500"
            >
              <img
                src="/assets/wedding/11.webp"
                loading="lazy"
                alt="Denah Lokasi Pernikahan"
                className="max-h-[380px] w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>

            <button
              onClick={() => setIsZoomed(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-900/10 px-3 py-3 font-cinzel text-[11px] font-semibold text-emerald-900 transition-all hover:bg-emerald-900/20 active:scale-[0.98]"
            >
              <ZoomIn className="h-3.5 w-3.5" />
              <span>Perbesar Denah</span>
            </button>

            {/* Langkah rute — daftar vertikal */}
            <div className="relative mt-5">
              <div className="absolute bottom-4 left-[13px] top-4 w-px bg-gold-400/30"></div>
              <div>
                {routes.map((route, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.18) }}
                    className="relative flex items-start gap-3 py-2.5"
                  >
                    <span
                      aria-hidden
                      className={`z-10 flex h-[26px] w-[26px] flex-shrink-0 rotate-45 items-center justify-center border ring-4 ring-[#faf6ee] ${
                        i === routes.length - 1
                          ? 'border-gold-300 bg-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.7)]'
                          : 'border-gold-400/50 bg-emerald-950'
                      }`}
                    >
                      <span
                        className={`-rotate-45 font-sans text-[10.5px] font-bold ${
                          i === routes.length - 1 ? 'text-emerald-950' : 'text-gold-300'
                        }`}
                      >
                        {route.step}
                      </span>
                    </span>
                    <div className="min-w-0 pt-px">
                      <p className="font-sans text-[13.5px] font-bold leading-snug text-emerald-950">{route.title}</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-stone-500">{route.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolofon */}
          <div className="mt-8 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-gold-400/40" />
            <span className="font-script text-[22px] leading-none text-gold-600/80">YF</span>
            <span className="h-px w-10 bg-gold-400/40" />
          </div>
        </motion.div>

        {/* Hitung mundur */}
        <div className="mt-6">
          <Countdown targetIso="2026-10-03T08:00:00+07:00" label="Menuju 3 Oktober 2026" />
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR ZOOMED MAP */}
      {createPortal(
        <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          >
            <button
              onClick={() => setIsZoomed(false)}
              aria-label="Tutup denah"
              className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:text-gold-400"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src="/assets/wedding/11.webp"
                loading="lazy"
                alt="Denah Lokasi Full"
                className="mx-auto max-h-[85vh] max-w-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};

export default LocationSection;
