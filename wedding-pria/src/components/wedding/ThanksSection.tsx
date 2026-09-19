import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MessageCircle } from 'lucide-react';
import KawungDivider from './KawungDivider';

export const ThanksSection: React.FC = () => {
  return (
    <section id="thanks" className="relative flex min-h-full flex-col justify-center overflow-hidden px-5 pb-16 pt-12">
      <div className="relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="parchment-card relative overflow-hidden rounded-[20px] border border-gold-400/50 p-6 text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold-400/50" />
            <span className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-600">
              Thank You
            </span>
            <span className="h-px w-8 bg-gold-400/50" />
          </div>

          <h2 className="font-playfair text-[26px] font-bold leading-snug text-emerald-950">
            Terima Kasih
          </h2>

          <KawungDivider className="my-5" />

          <p className="mx-auto max-w-[32ch] font-cormorant text-[16.5px] italic leading-relaxed text-stone-600">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila
            Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.
          </p>

          <p className="mx-auto mt-4 max-w-[32ch] font-sans text-[13px] leading-relaxed text-stone-500">
            Sampai jumpa di hari bahagia kami. Wassalamu&apos;alaikum Wr. Wb.
          </p>

          <p className="mt-6 font-script text-[34px] leading-none text-gold-600">
            Yusuf &amp; Fara
          </p>
          <p className="mt-2 font-cinzel text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
            11 October 2026
          </p>

          <div className="mt-8 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-gold-400/40" />
            <span className="font-script text-[22px] leading-none text-gold-600/80">YF</span>
            <span className="h-px w-10 bg-gold-400/40" />
          </div>
        </motion.div>

        {/* Kredit pembuat — di luar kartu */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 text-center"
        >
          <p className="font-sans text-[10.5px] tracking-wide text-stone-400">
            Crafted by
          </p>
          <p className="text-gold-gradient mt-1 font-alex text-[44px] leading-tight">
            Fredsz.
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-2">
            <a
              href="https://service.fredsz.dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website Fredsz"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-400/40 text-gold-300 transition-all hover:bg-gold-400/10 active:scale-95"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://wa.me/6285865913347"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Fredsz"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-400/40 text-gold-300 transition-all hover:bg-gold-400/10 active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-8 border-t border-gold-400/20 pt-4 text-center">
          <p className="font-sans text-[9px] text-stone-500">
            Yusuf &amp; Fara
          </p>
          <p className="mt-1 font-sans text-[9px] text-stone-500">
            © 2026 · All rights reserved
          </p>
        </footer>
      </div>
    </section>
  );
};

export default ThanksSection;
