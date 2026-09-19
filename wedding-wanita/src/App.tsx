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
import ConfettiBurst from './components/wedding/ConfettiBurst';
import type { WeddingSection } from './components/wedding/types';
import { prefetchWishes } from './lib/rsvp';
import { prefetchGift } from './lib/gift';

const ORDER: WeddingSection[] = ['hero', 'kisah', 'lokasi', 'rsvp', 'gift', 'thanks'];
const SUB_SECTIONS: WeddingSection[] = ['kisah', 'lokasi', 'rsvp', 'gift', 'thanks'];

export function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [audioTrigger, setAudioTrigger] = useState(false);
  const [activeSection, setActiveSection] = useState<WeddingSection>('hero');
  const [animateClose, setAnimateClose] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const confettiTimer = useRef(0);
  // Section yang pernah dibuka tetap ter-mount (disembunyikan) agar
  // iframe peta / state form tidak load ulang tiap pindah menu.
  const [visited, setVisited] = useState<WeddingSection[]>(['hero']);
  const rootRef = useRef<HTMLDivElement>(null);
  const containers = useRef(new Map<WeddingSection, HTMLDivElement>());
  // Ref stabil untuk StorySection (butuh RefObject, bukan elemen).
  const kisahRef = useRef<{ current: HTMLDivElement | null }>({ current: null });
  const lastSwipeNav = useRef(0);

  // Tiap ganti menu: tandai dikunjungi + scroll kontainernya ke atas.
  useEffect(() => {
    setVisited((v) => (v.includes(activeSection) ? v : [...v, activeSection]));
    if (activeSection === 'hero') {
      rootRef.current?.scrollTo?.({ top: 0 });
    } else {
      containers.current.get(activeSection)?.scrollTo({ top: 0 });
    }
  }, [activeSection]);

  // Prefetch ucapan + gift setelah undangan dibuka (siap sebelum menunya dibuka).
  useEffect(() => {
    if (isOpened) {
      prefetchWishes('wanita');
      prefetchGift('wanita');
    }
  }, [isOpened]);

  // Preload semua chunk menu saat idle — pindah menu tanpa spinner.
  useEffect(() => {
    if (!isOpened) return;
    const t = window.setTimeout(() => {
      void import('./components/wedding/StorySection');
      void import('./components/wedding/LocationSection');
      void import('./components/wedding/RsvpSection');
      void import('./components/wedding/GiftSection');
      void import('./components/wedding/ThanksSection');
    }, 2000);
    // Panaskan peta Google segera setelah pintu dibuka agar sudah di-cache
    // sebelum menu Lokasi dibuka — tanpa mengganggu load awal.
    const warm = window.setTimeout(() => {
      const f = document.createElement('iframe');
      f.src =
        'https://maps.google.com/maps?q=Dusun%20Tempel%2C%20Plumbon%2C%20Suruh%2C%20Kabupaten%20Semarang&t=&z=15&ie=UTF8&iwloc=&output=embed';
      f.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
      f.setAttribute('aria-hidden', 'true');
      f.tabIndex = -1;
      document.body.appendChild(f);
      window.setTimeout(() => f.remove(), 60000);
    }, 800);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(warm);
    };
  }, [isOpened]);

  // Swipe/scroll di ujung konten → pindah menu (tak perlu tekan menu bawah).
  useEffect(() => {
    if (!isOpened) return;
    const EDGE_PX = 8;
    const SWIPE_PX = 64;
    const COOLDOWN_MS = 900;

    const activeEl = () => {
      if (activeSection === 'hero') return null;
      return containers.current.get(activeSection) ?? null;
    };
    const atTop = () => {
      const el = activeEl();
      return !el || el.scrollTop <= EDGE_PX;
    };
    const atBottom = () => {
      const el = activeEl();
      // Hero tak bisa scroll → anggap selalu di ujung.
      if (!el) return true;
      return el.scrollHeight - el.scrollTop - el.clientHeight <= EDGE_PX;
    };

    const go = (dir: 1 | -1) => {
      if (Date.now() - lastSwipeNav.current < COOLDOWN_MS) return;
      setActiveSection((cur) => {
        const next = ORDER.indexOf(cur) + dir;
        if (next < 0 || next >= ORDER.length) return cur;
        lastSwipeNav.current = Date.now();
        return ORDER[next]!;
      });
    };

    // Jangan bajak scroll area bersarang (mis. pagination/list) yang masih bisa scroll.
    const nestedScrollable = (t: EventTarget | null, dir: 1 | -1): boolean => {
      const el = (t as HTMLElement | null)?.closest?.('[data-nested-scroll]') as HTMLElement | null;
      if (!el) return false;
      if (dir === 1) return el.scrollHeight - el.scrollTop - el.clientHeight > EDGE_PX;
      return el.scrollTop > EDGE_PX;
    };

    const target = activeEl() ?? rootRef.current;
    if (!target) return;

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
    // Ledakan konfeti menyusul pintu yang terbuka.
    window.clearTimeout(confettiTimer.current);
    confettiTimer.current = window.setTimeout(() => {
      setConfettiKey((k) => k + 1);
    }, 750);
  };

  const handleCloseInvitation = () => {
    window.clearTimeout(confettiTimer.current);
    setAnimateClose(true);
    setActiveSection('hero');
    setIsOpened(false);
  };

  const handleCloseAnimDone = useCallback(() => {
    setAnimateClose(false);
  }, []);

  const showOther = isOpened && activeSection !== 'hero';

  const renderSection = (s: WeddingSection) => {
    switch (s) {
      case 'kisah':
        return <StorySection scrollContainer={kisahRef} />;
      case 'lokasi':
        return <LocationSection />;
      case 'rsvp':
        return <RsvpSection side="wanita" />;
      case 'gift':
        return <GiftSection />;
      case 'thanks':
        return <ThanksSection />;
      default:
        return null;
    }
  };

  return (
    <div ref={rootRef} className="relative h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none bg-emerald-950 font-sans text-stone-800 selection:bg-gold-500/30 selection:text-gold-200">
      <HeroSection celebrate={isOpened} />
      <ConfettiBurst burstKey={confettiKey} />

      <CoverModal
        isOpen={!isOpened}
        onOpenInvitation={handleOpenInvitation}
        animateClose={animateClose}
        onCloseAnimDone={handleCloseAnimDone}
      />

      {isOpened && (
        <>
          {/* Embun jatuh hanya di menu tertentu (kisah & thanks), bukan sejak awal */}
          {(activeSection === 'kisah' || activeSection === 'thanks') && <FloatingPetals />}
          <TopControls onCloseInvitation={handleCloseInvitation} autoPlayTrigger={audioTrigger} />
          <BottomNav activeSection={activeSection} onNavigate={setActiveSection} />
        </>
      )}

      {showOther && (
        <div className="absolute inset-0 z-[45] flex items-center justify-center overflow-hidden bg-emerald-950">
          <div className="relative h-[100dvh] max-h-[100dvh] w-full max-w-[420px] overflow-hidden sm:h-[min(900px,96dvh)] sm:max-h-[96dvh] sm:rounded-2xl">
            {SUB_SECTIONS.filter((s) => visited.includes(s)).map((s) => (
              <div
                key={s}
                ref={(el) => {
                  if (s === 'kisah') kisahRef.current = el;
                  if (el) containers.current.set(s, el);
                  else containers.current.delete(s);
                }}
                className={`h-full overflow-y-auto overscroll-contain pb-[4.75rem] ${
                  s === activeSection ? '' : 'hidden'
                }`}
              >
                <Suspense fallback={null}>{renderSection(s)}</Suspense>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
