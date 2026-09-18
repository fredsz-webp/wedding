import React from 'react';
import { Home, BookOpen, MapPin, Heart, Gift, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WeddingSection } from './types';

const navItems: { id: WeddingSection; label: string; icon: typeof Home }[] = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'kisah', label: 'Kisah', icon: BookOpen },
  { id: 'lokasi', label: 'Lokasi', icon: MapPin },
  { id: 'rsvp', label: 'RSVP', icon: Heart },
  { id: 'gift', label: 'Gift', icon: Gift },
  { id: 'thanks', label: 'Thanks', icon: HeartHandshake },
];

interface BottomNavProps {
  activeSection: WeddingSection;
  onNavigate: (section: WeddingSection) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeSection, onNavigate }) => {
  return (
    <div className="pointer-events-none fixed bottom-16 left-0 right-0 z-50 flex justify-center sm:bottom-20">
      <motion.nav
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="pointer-events-auto w-[min(94%,20rem)]"
      >
        <div className="flex items-center justify-evenly rounded-full border border-gold-400/40 bg-emerald-950/95 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'text-gold-300' : 'text-stone-400 hover:text-gold-200'
                }`}
                title={item.label}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full border border-gold-400/40 bg-gold-500/20" />
                )}
                <Icon className="relative z-10 h-5 w-5" strokeWidth={1.75} />
              </button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
};

export default BottomNav;
