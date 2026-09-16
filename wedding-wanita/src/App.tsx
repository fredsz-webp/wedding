import { useState, useEffect, useCallback, useRef } from 'react';
import CoverModal from './components/wedding/CoverModal';
import HeroSection from './components/wedding/HeroSection';
import StorySection from './components/wedding/StorySection';
import LocationSection from './components/wedding/LocationSection';
import BottomNav from './components/wedding/BottomNav';
import TopControls from './components/wedding/TopControls';
import FloatingPetals from './components/wedding/FloatingPetals';
import type { WeddingSection } from './components/wedding/types';

export function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [audioTrigger, setAudioTrigger] = useState(false);
  const [activeSection, setActiveSection] = useState<WeddingSection>('hero');
  const [animateClose, setAnimateClose] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <div className="relative h-[100dvh] max-h-[100dvh] overflow-hidden overscroll-none bg-emerald-950 font-sans text-stone-800 selection:bg-gold-500/30 selection:text-gold-200">
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
              {activeSection === 'kisah' && <StorySection scrollContainer={scrollRef} />}
              {activeSection === 'lokasi' && <LocationSection />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
