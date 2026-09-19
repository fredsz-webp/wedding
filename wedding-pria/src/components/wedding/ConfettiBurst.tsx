import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  circle: boolean;
  life: number;
  maxLife: number;
}

const COLORS = ['#d4af37', '#f4e6b1', '#ffffff', '#e8b84a', '#1c553e', '#c5941c'];

/**
 * Ledakan konfeti emas sekali tiap burstKey berubah.
 * Canvas ringan tanpa dependency — hormat prefers-reduced-motion.
 */
export const ConfettiBurst: React.FC<{ burstKey: number }> = ({ burstKey }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (burstKey <= 0) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = (canvas.width = Math.floor(canvas.clientWidth * dpr));
    const H = (canvas.height = Math.floor(canvas.clientHeight * dpr));

    const N = window.innerWidth < 480 ? 90 : 140;
    const parts: Particle[] = Array.from({ length: N }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (3 + Math.random() * 7) * dpr;
      const maxLife = 130 + Math.random() * 60;
      return {
        x: W / 2 + (Math.random() - 0.5) * W * 0.25,
        y: H * 0.42 + (Math.random() - 0.5) * H * 0.1,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4 * dpr,
        w: (4 + Math.random() * 5) * dpr,
        h: (3 + Math.random() * 4) * dpr,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        color: COLORS[(Math.random() * COLORS.length) | 0]!,
        circle: Math.random() < 0.35,
        life: 0,
        maxLife,
      };
    });

    let raf = 0;
    const gravity = 0.16 * dpr;
    const drag = 0.988;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of parts) {
        p.life += 1;
        if (p.life >= p.maxLife) continue;
        alive = true;
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        const fade = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, fade * 1.4));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.circle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (alive) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [burstKey]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
};

export default ConfettiBurst;
