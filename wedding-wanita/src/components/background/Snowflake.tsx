import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  swayDistance: number;
  opacity: number;
}

const SnowflakeBackground: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  // Generate snowflakes
  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * -20,
      duration: 8 + Math.random() * 12,
      size: 4 + Math.random() * 8,
      swayDistance: 30 + Math.random() * 70,
      opacity: 0.4 + Math.random() * 0.6
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <>
      {/* Snowflakes Container */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute"
            style={{
              left: `${flake.left}%`,
              top: '-20px',
              fontSize: `${flake.size}px`,
              opacity: flake.opacity,
              color: 'white',
              textShadow: '0 0 5px rgba(255,255,255,0.9)',
              willChange: 'transform',
              animation: `fall-${flake.id} ${flake.duration}s linear ${flake.delay}s infinite`,
              zIndex: 1
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Dynamic Keyframes */}
      <style>{`
        ${snowflakes.map((flake) => `
          @keyframes fall-${flake.id} {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: 0;
            }
            5% {
              opacity: ${flake.opacity};
            }
            25% {
              transform: translateY(25vh) translateX(${flake.swayDistance * 0.5}px) rotate(90deg);
            }
            50% {
              transform: translateY(50vh) translateX(0px) rotate(180deg);
            }
            75% {
              transform: translateY(75vh) translateX(${-flake.swayDistance * 0.3}px) rotate(270deg);
            }
            95% {
              opacity: ${flake.opacity};
            }
            100% {
              transform: translateY(110vh) translateX(0) rotate(360deg);
              opacity: 0;
            }
          }
        `).join('\n')}
      `}</style>
    </>
  );
};

export default SnowflakeBackground;