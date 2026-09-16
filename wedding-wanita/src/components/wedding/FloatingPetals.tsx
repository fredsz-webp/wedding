import React, { useMemo } from 'react';

export const FloatingPetals: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.8 + Math.random() * 3) % 100}%`,
      animationDuration: `${7 + (i % 6) * 2}s`,
      animationDelay: `${(i * 0.7) % 8}s`,
      size: `${4 + (i % 4) * 3}px`,
      opacity: 0.2 + ((i % 5) * 0.12),
    }));
  }, []);

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
