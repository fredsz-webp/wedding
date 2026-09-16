import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  ChevronUpCircle,
} from 'lucide-react';

const playlist = [
  {
    title: 'Jinggle Bells',
    artist: 'James Lord',
    src: '/music/Jingle Bells - James Lord.mp3',
    cover: '/cover/chrismast.webp',
  },
  {
    title: 'Purwo',
    artist: 'Mahardika',
    src: '/music/Purwo - Mahardika Indra.mp3',
    cover: '/cover/purwo.webp',
  },
  {
    title: 'Laskar Pelangi',
    artist: 'Nidji',
    src: '/music/Nidji - Laskar Pelangi.mp3',
    cover: '/cover/laskar.webp',
  },
  {
    title: 'Lullaby of Woe',
    artist: 'Ashley Serena',
    src: '/music/Lullaby of Woe - Ashley Serena.mp3',
    cover: '/cover/lullaby.webp',
  },
  {
    title: 'Viva La Vida',
    artist: 'Coldplay',
    src: '/music/Coldplay - Viva La Vida.mp3',
    cover: '/cover/viva.webp',
  },
  {
    title: 'Tominos Hell',
    artist: 'Saijō Yaso',
    src: '/music/Tominos Hell - Saijō Yaso.mp3',
    cover: '/cover/tomino.webp',
  },
  {
    title: 'Love wins all',
    artist: 'IU',
    src: '/music/IU - Love wins all.mp3',
    cover: '/cover/love.webp',
  },
  {
    title: 'Melancholia',
    artist: 'Ryan Creep',
    src: '/music/Melancholia Music Box - Ryan Creep.mp3',
    cover: '/cover/melan.webp',
  },
  {
    title: 'Sparkle',
    artist: 'Radwimps',
    src: '/music/RADWIMPS - Sparkle.mp3',
    cover: '/cover/sparkle.webp',
  },
  {
    title: 'Ice Window',
    artist: 'Jacky Slow',
    src: '/music/Jacky Slow - Ice Window.mp3',
    cover: '/cover/ices.webp',
  },
  {
    title: 'Big Fish',
    artist: 'Zhou Shen',
    src: '/music/Zhou Shen - Big Fish.mp3',
    cover: '/cover/bigs.webp',
  },
];

interface WhatsAppButtonProps {
  initialPlay?: boolean;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ initialPlay = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(initialPlay);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = playlist[currentIndex];

  const playNext = () => setCurrentIndex((i) => (i + 1) % playlist.length);
  const playPrev = () => setCurrentIndex((i) => (i === 0 ? playlist.length - 1 : i - 1));

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Preload cover images
  useEffect(() => {
    setCoverLoaded(false);
    const img = new Image();
    img.src = currentTrack.cover;
    img.onload = () => setCoverLoaded(true);
    
    // Preload next and previous covers for instant switching
    const nextIndex = (currentIndex + 1) % playlist.length;
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    
    const nextImg = new Image();
    nextImg.src = playlist[nextIndex].cover;
    
    const prevImg = new Image();
    prevImg.src = playlist[prevIndex].cover;
  }, [currentIndex, currentTrack.cover]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.volume = 0.15;
      if (initialPlay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [currentIndex, initialPlay]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Audio Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-24 right-3 z-50 bg-white px-1 py-1 rounded-lg shadow-md flex items-center gap-1 w-[180px] h-[50px]"
      >
        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-200">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={currentTrack.cover}
              alt="Cover"
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: coverLoaded ? 1 : 0, scale: coverLoaded ? 1 : 0.8 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              loading="eager"
            />
          </AnimatePresence>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col text-[8px] w-[75px] truncate"
          >
            <span className="font-semibold text-black">{currentTrack.artist}</span>
            <span className="text-gray-500">{currentTrack.title}</span>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex gap-1 items-center">
          <button onClick={playPrev} aria-label="Previous track">
            <SkipBack className="w-4 h-4 text-blue-600" />
          </button>
          <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? (
              <Pause className="w-4 h-4 text-blue-600" />
            ) : (
              <Play className="w-4 h-4 text-blue-600" />
            )}
          </button>
          <button onClick={playNext} aria-label="Next track">
            <SkipForward className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        <audio ref={audioRef} hidden onEnded={playNext}>
          <source src={currentTrack.src} type="audio/mp3" />
        </audio>
      </motion.div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 z-50 text-gray-300 hover:text-blue-300 opacity-20 transition duration-300 hover:opacity-100 focus:outline-none focus-visible:text-blue-400 focus-visible:scale-110"
          aria-label="Scroll to top"
          tabIndex={0}
        >
          <ChevronUpCircle
            size={32}
            className="text-gray-300 hover:text-blue-300 transition duration-300 opacity-70 hover:opacity-100"
          />
        </motion.button>
      )}
    </>
  );
};

export default WhatsAppButton;