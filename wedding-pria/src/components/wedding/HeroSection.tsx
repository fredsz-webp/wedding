import React from 'react';
import InvitationCard from './InvitationCard';

/** Kartu undangan full-screen — sama persis saat peek cover & setelah pintu terbuka */
export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="fixed inset-0 z-40 flex h-[100dvh] max-h-[100dvh] items-center justify-center overflow-hidden overscroll-none bg-[#06140e]"
    >
      <div className="relative h-[100dvh] max-h-[100dvh] w-full max-w-[420px] overflow-hidden sm:h-[min(900px,96dvh)] sm:max-h-[96dvh] sm:rounded-2xl">
        <InvitationCard />
      </div>
    </section>
  );
};

export default HeroSection;
