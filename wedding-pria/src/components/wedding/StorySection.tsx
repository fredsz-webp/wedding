import React, { useEffect, useRef, useState } from 'react';
import { motion, useTransform, useMotionValue, useSpring } from 'framer-motion';
import KawungDivider from './KawungDivider';

interface StoryStep {
  period: string;
  title: string;
  content: string;
}

const stories: StoryStep[] = [
  {
    period: 'Awal 2023',
    title: 'Pertemuan yang Tenang',
    content:
      'Awalnya hanya sebuah kebetulan yang tenang. Saya Yusuf mengenal Faragita di awal tahun 2023 lewat sebuah dialog sederhana saat mencari rekan kerja, yang ternyata membuka jalan bagi dua takdir untuk saling menyapa. Di antara tumpukan tugas dan intensitas komunikasi yang perlahan menghangat, hadir rasa yang tak pernah kami rencanakan. Dari sekadar teman bertukar kabar, dia perlahan tumbuh menjadi tempat paling nyaman untuk pulang.',
  },
  {
    period: 'Agustus 2023',
    title: 'Memilih Berjalan Beriringan',
    content:
      'Pada Agustus 2023, rasa itu akhirnya menemukan keberaniannya. Tanpa ada kata “iya” yang terucap secara resmi, kami memilih berjalan beriringan. Kami biarkan waktu dan ketulusan tindakan yang menjadi penanda bahwa kami serius menjalani arah cerita ini.',
  },
  {
    period: 'Masa Perjuangan',
    title: 'Belajar Saling Menopang',
    content:
      'Ujian pertama datang saat ia memberanikan diri merintis jalannya sendiri. Di sanalah kisah kami benar-benar ditempa. Melihatnya jatuh bangun membangun usaha—menatap lelah di matanya dan air mata yang kerap ia sembunyikan rapat-rapat—membuat dada ini berdesir haru. Di titik itulah saya sadar, cinta bukan cuma tentang berbagi tawa, melainkan tentang keberanian untuk saling menopang saat hidup menguji jiwa.',
  },
  {
    period: 'Juni 2025',
    title: 'Mengikat Janji',
    content:
      'Hingga akhirnya pada Juni 2025, kami memilih untuk saling mengikat janji. Sebuah cincin sederhana hadir sebagai saksi tekad kami untuk melangkah lebih jauh. Meski masa tunangan kembali menguji dengan berbagai lika-liku, kami belajar bahwa tak ada badai yang terlalu besar selama kami saling bergandengan tangan.',
  },
  {
    period: 'Oktober 2026',
    title: 'Satu Tujuan, Selamanya',
    content:
      'Dan di bulan Oktober 2026 ini, dua jiwa yang dulu saling tak mau kalah, akhirnya menundukkan ego masing-masing untuk satu tujuan yang sama—berjalan bersama sebagai sepasang suami istri.',
  },
];

export const StorySection: React.FC<{ scrollContainer: React.RefObject<HTMLDivElement> }> = ({
  scrollContainer,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const lastDotRef = useRef<HTMLSpanElement>(null);
  const [lineH, setLineH] = useState(0);
  const [fillMax, setFillMax] = useState(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      // offsetHeight/offsetTop: posisi layout murni, tak terpengaruh animasi transform
      setLineH(el.offsetHeight);
      const dot = lastDotRef.current;
      if (dot) {
        let y = 0;
        let node: HTMLElement | null = dot;
        while (node && node !== el) {
          y += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        // Ujung garis diselipkan 4px di balik tepi atas kupat — tanpa gap, tanpa timpa
        setFillMax(y + 4);
      }
    };
    measure();
    if (document.fonts) document.fonts.ready.then(() => measure()).catch(() => {});
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Lacak scroll manual (tanpa useScroll framer) — deterministik di dev & prod
  const rawProgress = useMotionValue(0);
  useEffect(() => {
    const sc = scrollContainer.current;
    const list = listRef.current;
    if (!sc || !list) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const c = sc.getBoundingClientRect();
      const t = list.getBoundingClientRect();
      const startLine = c.top + c.height * 0.1;
      const endLine = c.top + c.height * 0.5;
      const total = startLine - (endLine - t.height);
      if (total <= 0) return;
      const p = (startLine - t.top) / total;
      rawProgress.set(Math.min(1, Math.max(0, p)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    sc.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      sc.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollContainer, rawProgress]);
  const journey = useSpring(rawProgress, { stiffness: 120, damping: 24 });
  const fillH = useTransform(journey, [0, 0.85], [0, fillMax]);
  const fillO = useTransform(journey, [0, 0.1], [0, 1]);

  return (
    <section id="kisah" className="relative overflow-hidden px-5 pb-16 pt-12">
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
                Our Love Story
              </span>
              <span className="h-px w-8 bg-gold-400/50" />
            </div>
            <h2 className="font-playfair text-[27px] font-bold leading-snug tracking-wide text-gold-200">
              Bukan Tentang Siapa yang Menang
            </h2>
            <p className="mx-auto mt-2 max-w-[32ch] font-cormorant text-[17px] italic leading-relaxed text-stone-300">
              Ini cerita singkat perjalanan dua hati menuju ikatan suci pernikahan.
            </p>
            <KawungDivider className="mt-5" />
          </motion.div>
        </div>

        {/* Timeline — titik sticky + garis isi setinggi daftar */}
        <div ref={listRef} className="relative">
          <div className="space-y-8">
            {stories.map((story, index) => {
              const isLast = index === stories.length - 1;
              return (
                <div key={index} className="flex items-start gap-3">
                  {/* Kolom titik — center mengikuti tinggi isi tiap kartu */}
                  <div className="relative z-10 flex w-7 shrink-0 items-center justify-center self-stretch">
                    <span
                      aria-hidden
                      ref={isLast ? lastDotRef : undefined}
                      className={`rotate-45 border ring-4 ring-emerald-950 ${
                        isLast
                          ? 'h-4 w-4 border-gold-200 bg-gold-300 shadow-[0_0_16px_rgba(212,175,55,0.95)]'
                          : 'h-4 w-4 border-gold-300 bg-gold-400'
                      }`}
                    />
                  </div>

                  {/* Kartu */}
                  <motion.div
                    className="min-w-0 flex-1"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.55 }}
                  >
                    <div className="parchment-card relative overflow-hidden rounded-[20px] p-5">
                      {/* Angka hantu editorial */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -right-2 -top-5 select-none font-playfair text-[92px] font-bold leading-none text-emerald-900/10"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-gold-400/20 px-3 py-1 font-cinzel text-[10.5px] font-bold uppercase tracking-widest text-emerald-950">
                          {story.period}
                        </span>
                        <span className="ml-auto font-playfair text-[15px] italic text-gold-700">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <h3 className="mb-2 font-playfair text-[19px] font-bold leading-snug text-emerald-950">
                        {story.title}
                      </h3>

                      <p
                        className={`font-cormorant text-[16.5px] italic leading-[1.7] text-stone-700 ${
                          index === 0
                            ? 'first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-playfair first-letter:text-[42px] first-letter:font-bold first-letter:leading-[0.85] first-letter:text-gold-700 first-letter:not-italic'
                            : ''
                        }`}
                      >
                        “{story.content}”
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Rel — setinggi daftar, ujung memudar */}
          <div
            aria-hidden
            className="absolute left-[13px] top-0 w-[2px]"
            style={{ height: lineH ? `${lineH}px` : undefined }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/40 to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]" />
            <motion.div
              className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-gold-200 via-gold-400 to-gold-600 shadow-[0_0_8px_rgba(212,175,55,0.65)]"
              style={{ height: fillH, opacity: fillO }}
            />
          </div>
        </div>

        {/* Penutup */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="parchment-card mt-8 rounded-[20px] border border-gold-400/30 p-6 text-center"
        >
          <div className="gold-divider mx-auto mb-4 w-24"></div>
          <p className="font-cormorant text-[17px] font-semibold italic leading-relaxed text-emerald-950">
            “Terima kasih sudah membaca setitik dari jutaan titik kisah kami berdua.”
          </p>
          <span className="mt-2 block font-alex text-[22px] text-gold-600">— Yusuf & Fara —</span>
        </motion.div>
      </div>
    </section>
  );
};

export default StorySection;
