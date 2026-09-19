import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Music, Home } from 'lucide-react';

interface TopControlsProps {
  onCloseInvitation?: () => void;
  autoPlayTrigger: boolean;
}

/** Tutup undangan (kiri atas) + musik latar (kanan atas) — sejajar bingkai kartu */
export const TopControls: React.FC<TopControlsProps> = ({ onCloseInvitation, autoPlayTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Musik 5,8MB HANYA diunduh setelah undangan dibuka (bukan saat load awal).
  const ensureSrc = () => {
    const el = audioRef.current;
    if (el && !el.getAttribute('src')) {
      el.src = '/music/pawestri.mp3';
      el.load();
    }
  };

  useEffect(() => {
    if (autoPlayTrigger && audioRef.current) {
      ensureSrc();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [autoPlayTrigger]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      ensureSrc();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  // Portal utama (domain utama) — tampil hanya kalau VITE_UTAMA_URL diisi.
  // Query (?to / ?u) diteruskan supaya nama tamu tidak hilang.
  const utamaBase = ((import.meta.env.VITE_UTAMA_URL as string | undefined) ?? '').replace(/\/+$/, '');
  const portalHref = utamaBase ? `${utamaBase}${window.location.search}` : '';

  return (
    <>
      <audio ref={audioRef} loop preload="none" />
      <motion.div
        initial={{ opacity: 0, y: -12, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="pointer-events-none fixed left-1/2 top-4 z-50 flex w-full max-w-[420px] items-start justify-between px-4"
      >
        {onCloseInvitation ? (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onCloseInvitation}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/40 bg-emerald-950 text-gold-300 shadow-xl transition-transform hover:scale-105 active:scale-95"
              title="Tutup Undangan"
              aria-label="Tutup Undangan"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
            {portalHref ? (
              <a
                href={portalHref}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/40 bg-emerald-950 text-gold-300 shadow-xl transition-transform hover:scale-105 active:scale-95"
                title="Kembali ke Pilihan Undangan"
                aria-label="Kembali ke Pilihan Undangan"
              >
                <Home className="h-4 w-4" strokeWidth={2} />
              </a>
            ) : null}
          </div>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={togglePlay}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/40 bg-emerald-950 shadow-xl transition-transform hover:scale-105 active:scale-95"
          title={isPlaying ? 'Matikan Musik' : 'Putar Musik'}
          aria-label="Toggle Music"
        >
          {isPlaying ? (
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              <Music className="h-4 w-4 text-gold-300" strokeWidth={1.75} />
            </motion.span>
          ) : (
            <Music className="relative z-10 h-4 w-4 text-stone-400" strokeWidth={1.75} />
          )}
        </button>
      </motion.div>
    </>
  );
};

export default TopControls;
