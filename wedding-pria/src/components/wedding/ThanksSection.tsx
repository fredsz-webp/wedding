import React from 'react';
import { motion } from 'framer-motion';

export const ThanksSection: React.FC = () => {
  return (
    <section id="thanks" className="relative overflow-hidden px-5 pb-16 pt-12">
      <div className="relative z-10">
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

          <div className="gold-divider mx-auto my-5 w-24"></div>

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
            11 Oktober 2026
          </p>

          <div className="mt-8 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-gold-400/40" />
            <span className="font-script text-[22px] leading-none text-gold-600/80">YF</span>
            <span className="h-px w-10 bg-gold-400/40" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ThanksSection;
