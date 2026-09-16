import { useState, useEffect } from 'react';
import { Gamepad2, HelpCircle, MousePointerClick, ArrowUp, ArrowDown, Space, Pin } from 'lucide-react';
import { useGame } from '../context/GameContext';

const GameToggleButton = () => {
  const [showLastUpdated, setShowLastUpdated] = useState(true);
  const [pinned, setPinned] = useState(false);
  const { showGame, setShowGame, showGuide, setShowGuide } = useGame();
  const [autoPinned, setAutoPinned] = useState(false); // untuk efek scroll

  // Simulasikan teks turun setelah delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLastUpdated(false);
    }, 2000);

    const handleScroll = () => {
      const scrollTop = window.scrollY;

      if (scrollTop > 50 && !pinned) {
        setAutoPinned(true);
        setPinned(true);
      } else if (scrollTop === 0 && autoPinned) {
        setPinned(false);
        setAutoPinned(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pinned, autoPinned]);

  return (
    <>
      {/* Tombol Game dan Panduan → hanya muncul di desktop */}
      <div className="hidden xl:flex fixed bottom-4 left-4 items-center gap-2 z-50">
        <button
          onClick={() => {
            setShowGame(prev => !prev);
            setShowGuide(false);
          }}
          className="p-2 bg-white/20 hover:bg-white/40 transition rounded-full backdrop-blur-md border border-white/40 text-white"
          
        >
          <Gamepad2 size={16} />
        </button>

        {showGame && (
          <div className="relative">
            <button
              onClick={() => setShowGuide(prev => !prev)}
              className="p-2 bg-white/20 hover:bg-white/40 transition rounded-full backdrop-blur-md border border-white/40 text-white"
            
            >
              <HelpCircle size={16} />
            </button>

            {showGuide && (
              <div className="absolute -top-52 -right-26 flex flex-col items-center z-50">
                <div className="relative bg-white/20 text-white text-xs md:text-sm px-6 pt-4 pb-4 rounded-xl shadow-lg backdrop-blur-md border border-white/30 font-medium space-y-3 text-left leading-snug min-w-[260px] max-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span>🕹️ Game shows on firstpage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointerClick size={16} />
                    <span>Click the dino</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Space size={16} />
                    <span>Press <b>Space</b> to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUp size={16} />
                    <span>Jump</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDown size={16} />
                    <span>Crouch</span>
                  </div>
                  <button
                    onClick={() => setShowGuide(false)}
                    className="absolute bottom-2 right-3 text-white hover:text-red-300 text-sm"
                    aria-label="Close guide"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Last Updated atau Pin → selalu tampil di semua device */}
      <div
        className="fixed left-[40px] bottom-20 z-50 -rotate-90 origin-bottom-left cursor-pointer"
        onClick={() => setPinned(prev => !prev)}
        title={pinned ? 'Click to show label' : 'Click to pin icon'}
      >
        {/* Teks Last Updated */}
        <div
          className={`flex items-center justify-center text-white text-[10px] tracking-widest transition-all duration-700 ease-in-out overflow-hidden`}
          style={{
            maxWidth: showLastUpdated || !pinned ? '200px' : '0px',
            opacity: showLastUpdated || !pinned ? 0.6 : 0,
            transition: 'all 0.5s ease-in-out',
          }}
        >
          {showLastUpdated || !pinned ? (
            <span className="hover:opacity-80 transition-opacity duration-300">
              Last Updated — 21 Dec 2025
            </span>
          ) : null}
        </div>

        {/* Ikon Pin */}
        <div
          className={`text-white transition-opacity duration-500 ease-in-out`}
          style={{
            opacity: !showLastUpdated && pinned ? 0.6 : 0,
            height: !showLastUpdated && pinned ? 'auto' : '0px',
            pointerEvents: !showLastUpdated && pinned ? 'auto' : 'none',
          }}
        >
          <Pin size={16} />
        </div>
      </div>
    </>
  );
};

export default GameToggleButton;
