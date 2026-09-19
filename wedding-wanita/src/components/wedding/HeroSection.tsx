import React from 'react';
import { motion } from 'framer-motion';
import InvitationCard from './InvitationCard';

/** Kartu undangan full-screen — masuk dengan pegas lembut tiap dibuka */
export const HeroSection: React.FC<{ celebrate?: boolean }> = ({ celebrate = false }) => {
  return (
    <section
      id="hero"
      className="fixed inset-0 z-40 flex h-[100dvh] max-h-[100dvh] items-center justify-center overflow-hidden overscroll-none bg-[#06140e]"
    >
      <motion.div
        initial={{ opacity: 0.5, scale: 0.962, y: 18 }}
        animate={celebrate ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.5, scale: 0.962, y: 18 }}
        transition={{ type: 'spring', stiffness: 120, damping: 19, mass: 0.9 }}
        className="relative h-[100dvh] max-h-[100dvh] w-full max-w-[420px] overflow-hidden sm:h-[min(900px,96dvh)] sm:max-h-[96dvh] sm:rounded-2xl"
      >
        <InvitationCard play={celebrate} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
