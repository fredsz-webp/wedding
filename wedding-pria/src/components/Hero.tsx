import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { ChevronDownCircle } from 'lucide-react';



const Hero = () => {
  const phrases = ["Merry Christmas!", "Let's Make It Happen Together!"];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [scrambledText, setScrambledText] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);

  const { showGame } = useGame();

  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-=+<>/?!@#$%&*';

  // Scramble animation
  useEffect(() => {
    const target = phrases[currentTextIndex];
    let frame = 0;

    const scrambleInterval = setInterval(() => {
      const progress = frame / 20;
      const updated = target
        .split('')
        .map((char: string, i: number) => {
          if (i < progress * target.length) return char;
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');

      setScrambledText(updated);
      frame++;

      if (progress >= 1) {
        clearInterval(scrambleInterval);
        setScrambledText(target);
      }
    }, 50);

    const nextTimeout = setTimeout(() => {
      setCurrentTextIndex((prev) => (prev + 1) % phrases.length);
    }, 4000);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(nextTimeout);
    };
  }, [currentTextIndex]);

  // Scroll detection & blur/scale effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowScrollButton(scrollTop < window.innerHeight * 0.8);
      setIsBlurred(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll ke section selanjutnya
  const handleScrollDown = () => {
    window.scrollTo({ top: window.innerHeight + 14, behavior: 'smooth' }); 
  };

  return (
    <>

      <section
        className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 overflow-hidden"
        style={{
          transform: isBlurred ? 'scale(0.95)' : 'scale(1)',
          filter: isBlurred ? 'blur(19px)' : 'none',
          transition: 'all 0.3s ease',
          backgroundColor: isBlurred ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
          backdropFilter: isBlurred ? 'blur(10px)' : 'none',
          marginTop: '-80px',
        }}
      >
        {/* Konten Tengah - Pusatkan vertikal dan horizontal */}
        <div className="relative text-center w-full flex items-center justify-center">
          <div className="relative w-[600px] md:w-[1000px] h-[240px] md:h-[400px] -mt-16">
            
            {/* Scrambled text */}
            <p className="absolute top-[34%] -translate-y-full left-[10%] md:left-[23%] text-red-500 font-mono font-bold text-sm md:text-base tracking-widest select-none px-4 text-center md:text-left drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {scrambledText}
            </p>

            {/* FREDSZ Video Mask */}
            <svg
              viewBox="0 0 1000 400" 
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full z-1 mt-4"
              style={{ 
                transform: 'translateY(10px)',
                overflow: 'visible'
              }}
            >
              <defs>
                <mask id="video-text-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="400">
                  <rect x="-10" y="-10" width="1020" height="420" fill="black" />
                  
                  <text
                    x="520"
                    y="210"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="240"
                    fontFamily="'Bebas Neue', sans-serif"
                    fill="white"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    transform="skewX(-10)"
                    style={{
                      paintOrder: 'stroke fill',
                      vectorEffect: 'non-scaling-stroke',
                      filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))'
                    }}
                  >
                    FREDSZ
                  </text>
                </mask>
                
                <clipPath id="video-clip">
                  <rect x="0" y="0" width="1000" height="400" />
                </clipPath>
              </defs>

              <foreignObject
                x="0"
                y="0"
                width="1000"
                height="400"
                mask="url(#video-text-mask)"
                clipPath="url(#video-clip)"
              >
                <div
                  style={{
                    filter: isBlurred ? 'blur(10px)' : 'none',
                    transform: isBlurred ? 'scale(0.95)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden'
                  }}
                >
                  <video
                    src="/assets/bg-foto/natal.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              </foreignObject>
            </svg>

            {/* Game */}
            {showGame && (
              <div className="absolute left-1/2 -translate-x-1/2 top-[85%] z-10">
                <div
                  style={{
                    filter: isBlurred ? 'blur(10px)' : 'none',
                    transform: isBlurred ? 'scale(0.95)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                  className="w-full h-full"
                >
                  <iframe
                    src="/t-rex-runner/index.html"
                    className="w-[320px] h-[150px] md:w-[600px] md:h-[170px]"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      touchAction: 'manipulation',
                      width: '100%',
                      height: '100%',
                    }}
                    scrolling="no"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Button */}
        {showScrollButton && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
            <motion.button
              onClick={handleScrollDown}
              aria-label="Scroll down"
              className="flex items-center justify-center"
              initial={{ y: 0 }}
              animate={{ y: [0, 12, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
              style={{
                all: 'unset',
                cursor: 'pointer',
              }}
            >
              <ChevronDownCircle
                size={32}
                className="text-red-500 opacity-70 hover:text-red-300 transition-colors duration-300"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))'
                }}
              />
            </motion.button>
          </div>
        )}
      </section>
    </>
  );
};

export default Hero;