import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuest } from '../../lib/guest';

interface CoverModalProps {
  isOpen: boolean;
  onOpenInvitation: () => void;
  /** Setelah klik Tutup: pintu menutup dulu, baru bebek muncul */
  animateClose?: boolean;
  onCloseAnimDone?: () => void;
}

const DOOR_MS = 1050;

/** Aset pintu — di-preload agar animasi buka tidak delay bolong */
const DOOR_ASSETS = ['/assets/wedding/1.png', '/assets/wedding/4.png', '/assets/wedding/3.png'];

function preloadImages(srcs: string[], timeoutMs = 8000): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    const timer = window.setTimeout(finish, timeoutMs);
    let loaded = 0;
    if (srcs.length === 0) {
      window.clearTimeout(timer);
      finish();
      return;
    }
    srcs.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded >= srcs.length) {
          window.clearTimeout(timer);
          finish();
        }
      };
      img.src = src;
    });
  });
}

/** Hanya pintu + bebek — kartu undangan ada di Hero di belakang */
export const CoverModal: React.FC<CoverModalProps> = ({
  isOpen,
  onOpenInvitation,
  animateClose = false,
  onCloseAnimDone,
}) => {
  const guestName = useGuest().name;
  const [doorsOpen, setDoorsOpen] = useState(animateClose);
  const [showDuck, setShowDuck] = useState(!animateClose);
  const [isOpening, setIsOpening] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);

  // Preload gambar pintu sekali — pintu baru tampil setelah aset siap.
  useEffect(() => {
    let cancelled = false;
    preloadImages(DOOR_ASSETS).then(() => {
      if (!cancelled) setAssetsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (animateClose) {
      // Mulai dari pintu terbuka → tutup → baru bebek
      setShowDuck(false);
      setDoorsOpen(true);
      setIsOpening(false);

      let closeId = 0;
      const startId = window.requestAnimationFrame(() => {
        closeId = window.requestAnimationFrame(() => {
          setDoorsOpen(false);
        });
      });

      const duckTimer = window.setTimeout(() => {
        setShowDuck(true);
        onCloseAnimDone?.();
      }, DOOR_MS + 80);

      return () => {
        window.cancelAnimationFrame(startId);
        window.cancelAnimationFrame(closeId);
        window.clearTimeout(duckTimer);
      };
    }

    setDoorsOpen(false);
    setShowDuck(true);
    setIsOpening(false);
  }, [isOpen, animateClose, onCloseAnimDone]);

  const handleOpen = () => {
    if (isOpening || doorsOpen || !showDuck || !assetsReady) return;
    setIsOpening(true);
    setShowDuck(false);
    setDoorsOpen(true);
    window.setTimeout(() => {
      onOpenInvitation();
      setIsOpening(false);
    }, DOOR_MS);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="gatefold-doors"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <div
            className="relative mx-auto h-[100dvh] w-full max-w-[420px] overflow-hidden sm:h-[min(900px,96dvh)] sm:rounded-2xl"
            style={{ perspective: '1400px' }}
          >
            {assetsReady && (
              <>
              {/* LEFT DOOR */}
            <motion.div
              className="absolute bottom-0 left-0 top-0 z-20 w-1/2 origin-left will-change-transform"
              initial={false}
              animate={{
                rotateY: doorsOpen ? -104 : 0,
                filter: doorsOpen ? 'brightness(0.6)' : 'brightness(1)',
              }}
              transition={{ duration: DOOR_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              <div className="relative h-full w-full">
                <img
                  src="/assets/wedding/1.png"
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ objectFit: 'fill' }}
                />

                <div className="absolute left-0 right-0 top-[22%] z-10 px-1 text-center sm:top-[24%]">
                  <p
                    className="font-script leading-[0.92] text-[#e8b84a] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                    style={{ fontSize: 'clamp(2rem, 10.5vw, 3rem)' }}
                  >
                    Yusuf
                    <br />
                    <span className="inline-block translate-x-[2px]">Fara</span>
                  </p>
                </div>

                <div className="absolute bottom-[11%] left-[4%] right-[6%] z-10 sm:bottom-[12%]">
                  <div
                    className="overflow-hidden bg-white px-3 py-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.28)] sm:px-3.5 sm:py-3"
                    style={{ borderRadius: '28px 0 28px 0' }}
                  >
                    <p
                      className="font-alex leading-tight text-[#1a1a1a]"
                      style={{ fontSize: 'clamp(9px, 2.8vw, 13px)' }}
                    >
                      Kepada Yth. Bapak/Ibu/Saudara
                    </p>
                    <p
                      className="mt-1 truncate font-playfair font-semibold capitalize tracking-wide text-[#1a3324]"
                      style={{ fontSize: 'clamp(11px, 3.2vw, 14px)' }}
                    >
                      {guestName}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT DOOR */}
            <motion.div
              className="absolute bottom-0 right-0 z-20 w-1/2 origin-right will-change-transform"
              initial={false}
              animate={{
                rotateY: doorsOpen ? 104 : 0,
                filter: doorsOpen ? 'brightness(0.6)' : 'brightness(1)',
              }}
              transition={{ duration: DOOR_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                top: '7.5%',
              }}
            >
              <div className="relative h-full w-full">
                <img
                  src="/assets/wedding/4.png"
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ objectFit: 'fill' }}
                />

                <div className="absolute bottom-[16%] left-0 right-0 z-10 flex justify-center sm:bottom-[17%]">
                  <span
                    className="font-script leading-none text-[#e8b84a] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    style={{ fontSize: 'clamp(1.6rem, 8vw, 2.4rem)' }}
                  >
                    YF
                  </span>
                </div>
              </div>
            </motion.div>
              </>
            )}

            <AnimatePresence>
              {showDuck && !doorsOpen && assetsReady && (
                <motion.button
                  type="button"
                  aria-label="Buka undangan"
                  onClick={handleOpen}
                  className="absolute left-1/2 top-1/2 z-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400"
                  initial={{ scale: 0.7, opacity: 0, x: '-50%', y: '-50%' }}
                  animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                  exit={{ scale: 0.4, opacity: 0, x: '-50%', y: '-50%', transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.span
                    className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24"
                    animate={{ y: [0, -8, 0], scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  >
                    {/* Ring pulse — penanda bisa dipencet */}
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-[#e8b84a]"
                      animate={{ scale: [1, 1.28, 1], opacity: [0.8, 0.25, 0.8] }}
                      transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                    />
                    <span className="absolute inset-0 rounded-full bg-[#e8b84a]/30 blur-md" />
                    <img
                      src="/assets/wedding/3.png"
                      alt=""
                      className="relative z-10 h-16 w-16 object-contain drop-shadow-[0_5px_12px_rgba(0,0,0,0.55)] sm:h-[4.5rem] sm:w-[4.5rem]"
                    />
                  </motion.span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Loading — tampil selama aset pintu diunduh */}
            <AnimatePresence>
              {!assetsReady && (
                <motion.div
                  key="door-loading"
                  className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-emerald-950"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                >
                  <motion.span
                    className="relative flex h-16 w-16 items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                  >
                    <span className="absolute inset-0 rounded-full border-2 border-[#e8b84a]/20" />
                    <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#e8b84a]" />
                    <span className="font-script text-[22px] leading-none text-[#e8b84a]">YF</span>
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoverModal;
