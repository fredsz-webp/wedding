import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Copy, Check, ExternalLink } from 'lucide-react';
import Countdown from './Countdown';

export const LocationSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [mapReady, setMapReady] = useState(false);

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
          </div>

          <div className="gold-divider my-6"></div>

          {/* Hitung mundur */}
          <Countdown targetIso="2026-10-03T08:00:00+07:00" label="Menuju 3 Oktober 2026" />

          <div className="gold-divider my-6"></div>

          {/* Peta interaktif */}
          <div>
            <div className="mb-3">
              <div>
                <h4 className="font-playfair text-[18px] font-bold leading-snug text-emerald-950">
                  Peta Lokasi
                </h4>
                <p className="font-cormorant text-[13.5px] italic text-stone-500">
                  Geser dan cubit peta untuk menjelajah sekitar lokasi acara
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-900/20">
              {!mapReady && <div className="shimmer-badge absolute inset-0 h-[280px]" aria-hidden />}
              <iframe
                title="Peta Lokasi Acara"
                src="https://maps.google.com/maps?q=Dusun%20Tempel%2C%20Plumbon%2C%20Suruh%2C%20Kabupaten%20Semarang&t=&z=15&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setMapReady(true)}
                className={`relative h-[280px] w-full transition-opacity duration-500 ${mapReady ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          </div>

          {/* Tombol aksi — di bawah peta */}
          <div className="mt-4 flex flex-col gap-2.5">
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

          <div className="gold-divider my-6"></div>

          {/* Kolofon */}
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

export default LocationSection;
