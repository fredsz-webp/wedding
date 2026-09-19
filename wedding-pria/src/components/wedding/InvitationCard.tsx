import React from 'react';
import { motion } from 'framer-motion';
import { useGuest } from '../../lib/guest';

/** Nama mempelai muncul huruf per huruf — mulai SAAT pintu dibuka (bukan saat halaman dimuat) */
const StaggerName: React.FC<{ text: string; play: boolean; baseDelay?: number }> = ({
  text,
  play,
  baseDelay = 0.3,
}) => (
  <span style={{ display: 'inline-block' }} aria-label={text}>
    {text.split('').map((ch, i) => (
      <motion.span
        key={i}
        aria-hidden
        style={{ display: 'inline-block', whiteSpace: 'pre' }}
        initial={{ opacity: 0, y: 16, rotate: 4 }}
        animate={play ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 16, rotate: 4 }}
        transition={{ delay: baseDelay + i * 0.035, type: 'spring', stiffness: 260, damping: 21 }}
      >
        {ch}
      </motion.span>
    ))}
  </span>
);

/** Kotak centang jadwal — tercentang otomatis sesuai data tamu di dashboard */
const EventCheck: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 11,
      height: 11,
      border: '1.5px solid #111',
      background: checked ? '#1a1a1a' : 'transparent',
      color: '#e8c34a',
      fontSize: 9,
      lineHeight: 1,
      flexShrink: 0,
      marginTop: 1,
    }}
  >
    {checked ? '✓' : ''}
  </span>
);

/** Ornament scrollwork SVG — cermin kiri/kanan */
const Flourish: React.FC<{ flip?: boolean }> = ({ flip = false }) => (
  <svg
    viewBox="0 0 90 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-[14px] w-auto"
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    {/* garis horizontal */}
    <line x1="0" y1="11" x2="60" y2="11" stroke="#1a1a1a" strokeWidth="0.8" />
    {/* scroll kiri */}
    <path
      d="M60 11 C65 5, 70 4, 74 8 C78 12, 75 18, 70 16 C65 14, 66 9, 70 9"
      stroke="#1a1a1a"
      strokeWidth="0.9"
      fill="none"
    />
    {/* bulatan kecil */}
    <circle cx="70" cy="9" r="1.2" fill="#1a1a1a" />
    {/* ekor ornament atas */}
    <path
      d="M74 8 C80 2, 86 3, 88 7 C90 10, 88 14, 85 13"
      stroke="#1a1a1a"
      strokeWidth="0.8"
      fill="none"
    />
    {/* leaf/petal */}
    <path d="M85 13 C83 17, 79 18, 78 15 C77 12, 80 10, 82 12" stroke="#1a1a1a" strokeWidth="0.7" fill="none" />
  </svg>
);

/** Kartu undangan — cocok dengan desain cetak (6.png) */
export const InvitationCard: React.FC<{ className?: string; play?: boolean }> = ({
  className = '',
  play = true,
}) => {
  const { events, invalid } = useGuest();
  // Tamu lama tanpa field events dianggap diundang (default).
  // Link karangan (invalid) tidak dapat centang apa pun.
  const invited11 = invalid ? false : events === null ? false : events.length === 0 || events.includes('pria-11-okt');

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col overflow-hidden ${className}`}
      style={{ background: '#f0e6c8' }}
    >
      {/* ── Background joglo — full bleed, mencakup krem + border + ilustrasi ── */}
      <img
        src="/assets/wedding/7.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        style={{ objectFit: 'fill' }}
      />

      {/* ── Merpati — kanan tengah, sedikit keluar tepi ── */}
      <img
        src="/assets/wedding/9.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute z-[15]"
        style={{
          right: '-2%',
          top: '28%',
          height: '11%',
          width: 'auto',
          objectFit: 'contain',
          opacity: 0.92,
        }}
      />

      {/* ── Frame kotak penuh + "We will wait for you" di garis atas (kanan) & bawah (kiri) ── */}
      <div
        className="pointer-events-none absolute z-[20]"
        style={{ top: 32, bottom: 32, left: 22, right: 22 }}
      >
        {/* stub vertikal — putus di tengah, hanya di sudut */}
        <div style={{ position: 'absolute', left: 0, top: 0, height: 120, width: 1, background: '#1a1a1a' }} />
        <div style={{ position: 'absolute', left: 0, bottom: 0, height: 120, width: 1, background: '#1a1a1a' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, height: 120, width: 1, background: '#1a1a1a' }} />
        <div style={{ position: 'absolute', right: 0, bottom: 0, height: 120, width: 1, background: '#1a1a1a' }} />

        {/* sisi atas: garis panjang + teks (kanan) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', height: 0 }}>
          <span style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 13,
              fontStyle: 'italic',
              color: '#c8a43a',
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
              lineHeight: 1,
              padding: '0 16px',
            }}
          >
            We will wait for you
          </span>
          <span style={{ width: 34, height: 1, background: '#1a1a1a', flexShrink: 0 }} />
        </div>

        {/* sisi bawah: teks (kiri) + garis panjang */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', height: 0 }}>
          <span style={{ width: 34, height: 1, background: '#1a1a1a', flexShrink: 0 }} />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 13,
              fontStyle: 'italic',
              color: '#c8a43a',
              letterSpacing: 0.5,
              whiteSpace: 'nowrap',
              lineHeight: 1,
              padding: '0 16px',
            }}
          >
            We will wait for you
          </span>
          <span style={{ flex: 1, height: 1, background: '#1a1a1a' }} />
        </div>
      </div>

      {/* ══════════════════════════════════════
          KONTEN UTAMA
      ══════════════════════════════════════ */}
      <div
        className="relative z-[10] flex h-full min-h-0 flex-col items-center"
        style={{ padding: '40px 20px', gap: 0, overflowY: 'auto' }}
      >
        <div
          style={{
            margin: 'auto 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
        {/* Bismillah */}
        <p
          dir="rtl"
          lang="ar"
          style={{
            fontFamily: "'Amiri', 'Scheherazade New', 'Traditional Arabic', serif",
            fontSize: 'clamp(17px,4.5vw,22px)',
            lineHeight: 1.4,
            color: '#111',
            marginBottom: 6,
            textAlign: 'center',
          }}
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>

        {/* Doa */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(9px,2.3vw,10.5px)',
            lineHeight: 1.65,
            color: '#111',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Ya Allah, dengan segala kesucian hati,<br />
          kami bersujud memohon Ridho-Mu,<br />
          untuk menuju Sunnah Rasul-Mu membentuk<br />
          keluarga yang sakinah, mawaddah, warahmah.
        </p>

        {/* Nama pengantin pria (di atas) */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(21px,5.6vw,26px)',
            fontStyle: 'italic',
            fontWeight: 700,
            color: '#d4900a',
            lineHeight: 1.15,
            textAlign: 'center',
            marginBottom: 3,
          }}
        >
          <StaggerName text="Khoyrul Yusuf Maulana" play={play} baseDelay={0.3} />
        </p>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(8.5px,2.2vw,10px)',
            color: '#111',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Putra Pertama dari Bapak. Suwarno &amp; Ibu Tugiyah
        </p>

        {/* Divider ornamen + Dengan */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 4,
            width: '100%',
          }}
        >
          <Flourish />
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(12px,3.2vw,14px)',
              fontStyle: 'italic',
              color: '#1a1a1a',
              whiteSpace: 'nowrap',
            }}
          >
            Dengan
          </span>
          <Flourish flip />
        </div>

        {/* Nama pengantin wanita */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(21px,5.6vw,26px)',
            fontStyle: 'italic',
            fontWeight: 700,
            color: '#d4900a',
            lineHeight: 1.15,
            textAlign: 'center',
            marginBottom: 3,
          }}
        >
          <StaggerName text="Aprilia Faragita" play={play} baseDelay={0.9} />
        </p>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(8.5px,2.2vw,10px)',
            color: '#111',
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          Putri Pertama dari Bapak. Sutrisno &amp; Ibu Tri Widyati
        </p>

        {/* Kalimat pengantar jadwal */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(9px,2.3vw,10.5px)',
            fontStyle: 'italic',
            color: '#111',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Insya Allah Akan diselenggarakan Pada
        </p>

        {/* ── Jadwal — pakai z-index agar tampil di atas watermark ── */}
        <div
          className="relative z-[5] w-full"
          style={{ marginBottom: 8 }}
        >
          {/* Jadwal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              paddingLeft: 20,
            }}
          >
            <EventCheck checked={invited11} />
            <p
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(9px,2.3vw,10.5px)',
                color: '#111',
                lineHeight: 1.5,
              }}
            >
              Minggu, 11 Oktober 2026 &nbsp;&nbsp; Pukul: 13.00-20.00 WIB
            </p>
          </div>
        </div>

        {/* Lokasi */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(14px,3.8vw,17px)',
            fontWeight: 700,
            color: '#111',
            lineHeight: 1.3,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Dusun Singkil, RT.02/RW.03<br />
          Desa Karanggondang, Kec. Pabelan, Kab. Semarang
        </p>

        {/* Teks penutup */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(8.5px,2.2vw,10px)',
            color: '#111',
            lineHeight: 1.6,
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          Tiada yang dapat kami ungkapkan selain rasa terima kasih<br />
          dari hati yang tulus apabila Bapak/Ibu/Saudara/i berkenan hadir<br />
          untuk memberikan do&apos;a restu kepada kedua mempelai.
        </p>

        {/* Hormat Kami */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(8.5px,2.2vw,10px)',
            color: '#111',
            lineHeight: 1.65,
            textAlign: 'center',
          }}
        >
          Hormat Kami,<br />
          Bp. Agus, Ibu Tugiyah, Khoyrul Yusuf
        </p>
        </div>
      </div>
    </div>
  );
};

export default InvitationCard;
