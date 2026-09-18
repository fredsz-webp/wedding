import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Check, Copy, Gift, MapPin } from 'lucide-react';
import { fetchGift, subscribeGift } from '../../lib/gift';

/* Default lokal — digantikan data dari dashboard (Firestore) bila ada. */
const DEFAULT_BANK = { number: '0000000000', owner: 'Aprilia Faragita' };
const DEFAULT_ADDRESS = 'Dusun Tempel, RT.25/RW.06, Plumbon, Kec. Suruh, Kab. Semarang';

/** Logo bank — kunci harus huruf kapital sesuai dropdown dashboard. */
const BANK_LOGOS: Record<string, string> = {
  BCA: '/assets/banks/bca.svg',
  BRI: '/assets/banks/bri.svg',
  BNI: '/assets/banks/bni.svg',
  MANDIRI: '/assets/banks/mandiri.svg',
  BSI: '/assets/banks/bsi.svg',
};

function BankLogo({ bank }: { bank: string }) {
  const src = BANK_LOGOS[bank.trim().toUpperCase()];
  if (!src) {
    return (
      <p className="mt-1 font-cinzel text-[12px] font-bold uppercase tracking-[0.2em] text-gold-600">
        {bank || 'Bank'}
      </p>
    );
  }
  return <img src={src} alt={`Logo ${bank}`} loading="lazy" className="mx-auto mt-2 h-9 w-auto object-contain" />;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('Salin manual:', text);
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="btn-gold flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 font-cinzel text-[11.5px] font-bold uppercase tracking-wider transition-transform active:scale-[0.98]"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-950" /> : <Copy className="h-4 w-4 text-emerald-950" />}
      <span>{copied ? 'Tersalin!' : label}</span>
    </button>
  );
}

export const GiftSection: React.FC = () => {
  const [bank, setBank] = useState('BCA');
  const [number, setNumber] = useState(DEFAULT_BANK.number);
  const [owner, setOwner] = useState(DEFAULT_BANK.owner);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);

  // Realtime dari dashboard (tanpa mengubah tampilan awal).
  useEffect(() => {
    const apply = (g: { bank: string; number: string; owner: string; address: string } | null) => {
      if (!g) return;
      if (g.bank) setBank(g.bank);
      if (g.number) setNumber(g.number);
      if (g.owner) setOwner(g.owner);
      if (g.address) setAddress(g.address);
    };
    fetchGift('wanita').then(apply);
    return subscribeGift('wanita', apply);
  }, []);

  return (
    <section id="gift" className="relative overflow-hidden px-5 pb-16 pt-12">
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold-400/50" />
              <span className="font-cinzel text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-400">
                Wedding Gift
              </span>
              <span className="h-px w-8 bg-gold-400/50" />
            </div>
            <h2 className="font-playfair text-[27px] font-bold leading-snug tracking-wide text-gold-200">
              Tanda Kasih
            </h2>
            <p className="mx-auto mt-2 max-w-[34ch] font-cormorant text-[17px] italic leading-relaxed text-stone-300">
              Kehadiran Anda sudah merupakan hadiah terindah. Namun jika berkenan memberi tanda kasih,
              kami sediakan dengan penuh syukur.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5" aria-hidden>
              <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold-400/60" />
              <span className="block h-1.5 w-1.5 rotate-45 bg-gold-400/80" />
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold-400/60" />
            </div>
          </motion.div>
        </div>

        {/* Transfer bank */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="parchment-card relative overflow-hidden rounded-[20px] border border-gold-400/50 p-5 text-center"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900">
            <Building2 className="h-6 w-6 text-gold-300" />
          </span>
          <h3 className="mt-3 font-playfair text-[20px] font-bold text-emerald-950">Transfer Bank</h3>
          <BankLogo bank={bank} />
          <p className="mt-2 font-mono text-[22px] font-bold tracking-wider text-emerald-950">
            {number}
          </p>
          <p className="font-sans text-[13px] text-stone-500">a.n. {owner}</p>
          <div className="mt-4">
            <CopyButton text={number} label="Salin Nomor Rekening" />
          </div>
        </motion.div>

        {/* Kado fisik */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="parchment-card relative mt-4 overflow-hidden rounded-[20px] border border-gold-400/50 p-5 text-center"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900">
            <Gift className="h-6 w-6 text-gold-300" />
          </span>
          <h3 className="mt-3 font-playfair text-[20px] font-bold text-emerald-950">Kirim Kado Fisik</h3>
          <p className="mx-auto mt-2 flex max-w-[30ch] items-start justify-center gap-1.5 font-sans text-[13.5px] leading-relaxed text-stone-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-900" />
            <span>{address}</span>
          </p>
          <div className="mt-4">
            <CopyButton text={address} label="Salin Alamat" />
          </div>

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

export default GiftSection;
