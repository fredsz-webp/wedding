import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import CoverModal from './components/wedding/CoverModal';
import HeroSection from './components/wedding/HeroSection';
// Section bawah di-load malas (code split) — bundle awal hanya hero + cover.
const StorySection = lazy(() => import('./components/wedding/StorySection'));
const LocationSection = lazy(() => import('./components/wedding/LocationSection'));
const RsvpSection = lazy(() => import('./components/wedding/RsvpSection'));
const GiftSection = lazy(() => import('./components/wedding/GiftSection'));
const ThanksSection = lazy(() => import('./components/wedding/ThanksSection'));
import BottomNav from './components/wedding/BottomNav';
import TopControls from './components/wedding/TopControls';
import FloatingPetals from './components/wedding/FloatingPetals';
import type { WeddingSection } from './components/wedding/types';
import { prefetchWishes } from './lib/rsvp';

export function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [audioTrigger, setAudioTrigger] = useState(false);
  const [activeSection, setActiveSection] = useState<WeddingSection>('hero');
  const [animateClose, setAnimateClose] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastSwipeNav = useRef(0);

  // Tiap ganti menu, scroll kembali ke atas.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  // Prefetch ucapan setelah undangan dibuka (tidak membebani load awal).
  useEffect(() => {
    if (isOpened) prefetchWishes('pria');
  }, [isOpened]);

  // Swipe/scroll di ujung konten → pindah menu (tak perlu tekan menu bawah).
  // Urutan: hero → kisah → lokasi → rsvp → gift → thanks.
  useEffect(() => {
    if (!isOpened) return;
    const order: WeddingSection[] = ['hero', 'kisah', 'lokasi', 'rsvp', 'gift', 'thanks'];
    const EDGE_PX = 8;
    const SWIPE_PX = 64;
    const COOLDOWN_MS = 900;

    const go = (dir: 1 | -1) => {
      if (Date.now() - lastSwipeNav.current < COOLDOWN_MS) return;
      setActiveSection((cur) => {
        const next = order.indexOf(cur) + dir;
        if (next < 0 || next >= order.length) return cur;
        lastSwipeNav.current = Date.now();
        return order[next]!;
      });
    };
    const atTop = () => {
      const el = scrollRef.current;
      return !el || el.scrollTop <= EDGE_PX;
    };
    const atBottom = () => {
      const el = scrollRef.current;
      // Hero tak bisa scroll → anggap selalu di ujung.
      if (!el) return true;
      return el.scrollHeight - el.scrollTop - el.clientHeight <= EDGE_PX;
    };

    const target = scrollRef.current ?? rootRef.current;
    if (!target) return;

    // Jangan bajak scroll area bersarang (mis. daftar ucapan) yang masih bisa scroll.
    const nestedScrollable = (t: EventTarget | null, dir: 1 | -1): boolean => {
      const el = (t as HTMLElement | null)?.closest?.('[data-nested-scroll]') as HTMLElement | null;
      if (!el) return false;
      if (dir === 1) return el.scrollHeight - el.scrollTop - el.clientHeight > EDGE_PX;
      return el.scrollTop > EDGE_PX;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        if (!nestedScrollable(e.target, 1) && atBottom()) go(1);
      } else if (e.deltaY < 0) {
        if (!nestedScrollable(e.target, -1) && atTop()) go(-1);
      }
    };

    let touchY: number | null = null;
    let touchTarget: EventTarget | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
      touchTarget = e.target;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = (e.changedTouches[0]?.clientY ?? touchY) - touchY;
      const t = touchTarget;
      touchY = null;
      touchTarget = null;
      if (dy <= -SWIPE_PX) {
        if (!nestedScrollable(t, 1) && atBottom()) go(1);
      } else if (dy >= SWIPE_PX) {
        if (!nestedScrollable(t, -1) && atTop()) go(-1);
      }
    };

    target.addEventListener('wheel', onWheel, { passive: true });
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      target.removeEventListener('wheel', onWheel);
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchend', onTouchEnd);
    };
  }, [isOpened, activeSection]);

  useEffect(() => {
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.height = '100dvh';
    return () => {
      html.style.overflow = '';
      document.body.style.overflow = '';
      html.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.height = '';
    };
  }, []);

  const handleOpenInvitation = () => {
    setIsOpened(true);
    setAnimateClose(false);
    setActiveSection('hero');
    setAudioTrigger(true);
  };

  const handleCloseInvitation = () => {
    setAnimateClose(true);
    setActiveSection('hero');
    setIsOpened(false);
  };

  const handleCloseAnimDone = useCallback(() => {
    setAnimateClose(false);
  }, []);

  const showOther = isOpened && activeSection !== 'hero';

  return (
    <div ref={rootRef} className="relative h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none bg-emerald-950 font-sans text-stone-800 selection:bg-gold-500/30 selection:text-gold-200">
      <HeroSection />

      <CoverModal
        isOpen={!isOpened}
        onOpenInvitation={handleOpenInvitation}
        animateClose={animateClose}
        onCloseAnimDone={handleCloseAnimDone}
      />

      {isOpened && (
        <>
          <FloatingPetals />
          <TopControls onCloseInvitation={handleCloseInvitation} autoPlayTrigger={audioTrigger} />
          <BottomNav activeSection={activeSection} onNavigate={setActiveSection} />
        </>
      )}

      {showOther && (
        <div className="absolute inset-0 z-[45] flex items-center justify-center overflow-hidden bg-emerald-950">
          <div className="relative h-[100dvh] max-h-[100dvh] w-full max-w-[420px] overflow-hidden sm:h-[min(900px,96dvh)] sm:max-h-[96dvh] sm:rounded-2xl">
            <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain pb-[4.75rem]">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-20">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400/20 border-t-gold-400" />
                  </div>
                }
              >
                {activeSection === 'kisah' && <StorySection scrollContainer={scrollRef} />}
                {activeSection === 'lokasi' && <LocationSection />}
                {activeSection === 'rsvp' && <RsvpSection side="pria" />}
                {activeSection === 'gift' && <GiftSection />}
                {activeSection === 'thanks' && <ThanksSection />}
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
