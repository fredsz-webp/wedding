import React, { useMemo } from 'react';

export const FloatingPetals: React.FC = () => {
  // Hormati HP low-end & reduced-motion: sedikit partikel, mati total bila diminta OS.
  const disabled = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const particles = useMemo(() => {
    if (disabled) return [];
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${(i * 8.3 + Math.random() * 4) % 100}%`,
      animationDuration: `${8 + (i % 5) * 2}s`,
      animationDelay: `${(i * 0.9) % 9}s`,
      size: `${3 + (i % 3) * 2}px`,
      opacity: 0.15 + ((i % 5) * 0.1),
    }));
  }, [disabled]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingPetals;
