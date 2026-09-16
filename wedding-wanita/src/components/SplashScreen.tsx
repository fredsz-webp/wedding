import React, { useState, useEffect, useMemo } from 'react';
interface SplashScreenProps {
  onFinish: (withMusic: boolean) => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [scrambleText, setScrambleText] = useState('');

  const fullText = "INITIALIZING SYSTEM";
  const finalText = "FREDSZ";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>/?\\|`~░▒▓█01";

  // Memoize particles untuk menghindari re-render
  const particles = useMemo(
    () => Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: i * 0.2,
      size: Math.random() * 4 + 2,
    })),
    []
  );

  useEffect(() => {
    let scrambleCount = 0;
    let isMounted = true;

    // Scramble text effect - dipercepat dari 80ms ke 50ms
    const scrambleInterval = setInterval(() => {
      if (!isMounted) return;

      if (scrambleCount < 8) {
        let newText = "";
        for (let j = 0; j < fullText.length; j++) {
          if (fullText[j] === " ") {
            newText += " ";
          } else {
            newText += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        setScrambleText(newText);
        scrambleCount++;
      } else if (scrambleCount === 8) {
        setScrambleText(finalText);
        scrambleCount++;
        clearInterval(scrambleInterval);
      }
    }, 50);

    // Loading dipercepat dari 3500ms ke 2500ms
    const loadingTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        setTimeout(() => {
          if (isMounted) setShowContent(true);
        }, 300);
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(loadingTimer);
      clearInterval(scrambleInterval);
    };
  }, []);

  return (
    <div className="splash-container">
      {/* Background dengan animasi optimized */}
      <div className="background-animation">
        <div className="grid-lines"></div>
        <div className="glowing-particles">
          {particles.map(p => (
            <div
              key={p.id}
              className="glow-particle"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                animationDelay: `${p.delay}s`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                willChange: 'transform, opacity',
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Konten utama */}
      <div className="splash-content">
        {/* Judul dengan efek scramble */}
        <div className="title-section">
          <h1 className="cyber-title">
            {scrambleText || fullText}
          </h1>
        </div>

        {/* Loading indicator dan Tombol - Diposisikan lebih mepet */}
        <div className="interactive-section">
          <div 
            className="loading-section" 
            style={{ 
              opacity: isLoading ? 1 : 0, 
              pointerEvents: isLoading ? 'auto' : 'none' 
            }}
          >
            <div className="cyber-loading">
              <div className="cyber-loading-bar">
                <div className="cyber-loading-progress"></div>
              </div>
              <div className="loading-status">
                <span className="loading-message">LOADING PORTFOLIO</span>
              </div>
            </div>
          </div>

          {/* Tombol - lebih kecil dan mepet */}
          <div
            className="action-section"
            style={{ 
              opacity: showContent ? 1 : 0, 
              pointerEvents: showContent ? 'auto' : 'none' 
            }}
          >
            <button
              className="main-cyber-button"
              onClick={() => onFinish(true)}
            >
              <span className="button-icon">▶</span>
              <span className="button-text">START</span>
            </button>

            <div
              className="alternative-option"
              onClick={() => onFinish(false)}
            >
              <span className="alternative-text">without music</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles - Optimized */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap');

        * {
          box-sizing: border-box;
        }

        .splash-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #000000, #050517, #000000);
          overflow: hidden;
          color: #0afbff;
          font-family: 'Share Tech Mono', monospace;
          z-index: 100;
        }

        .background-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          will-change: transform;
        }

        .grid-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(to right, rgba(10, 251, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 251, 255, 0.02) 1px, transparent 1px);
          background-size: 80px 80px;
          will-change: transform;
        }

        .glowing-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .glow-particle {
          position: absolute;
          background: #0afbff;
          border-radius: 50%;
          filter: blur(0.5px);
          opacity: 0;
          animation: floatParticle 6s infinite ease-in-out;
        }

        @keyframes floatParticle {
          0%, 100% { 
            transform: translate(0, 0) scale(0.3);
            opacity: 0;
          }
          50% { 
            transform: translate(calc(var(--tx, 0) * 1px), calc(var(--ty, 0) * 1px)) scale(1);
            opacity: 0.3;
          }
        }

        .splash-content {
          text-align: center;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 320px;
          padding: 20px;
          gap: 25px; /* Dikurangi dari 40px */
          position: relative;
          min-height: 100vh;
        }

        .title-section {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60px; /* Dikurangi dari 80px */
          margin-bottom: 10px; /* Dikurangi dari 20px */
        }

        .cyber-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem; /* Dikurangi dari 2rem */
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #0afbff;
          text-shadow: 0 0 10px #0afbff;
          margin: 0;
          min-height: 45px; /* Dikurangi dari 60px */
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          will-change: auto;
          contain: layout style paint;
          white-space: nowrap;
          overflow: hidden;
        }

        .interactive-section {
          width: 100%;
          max-width: 260px; /* Dikurangi dari 300px */
          margin: 0 auto;
          position: relative;
          min-height: 90px; /* Dikurangi dari 120px */
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .loading-section {
          width: 100%;
          transition: opacity 0.3s ease;
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cyber-loading {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(10, 251, 255, 0.15);
          border-radius: 3px; /* Dikurangi dari 4px */
          padding: 10px; /* Dikurangi dari 12px */
          backdrop-filter: blur(3px);
          width: 100%;
        }

        .cyber-loading-bar {
          width: 100%;
          height: 3px; /* Dikurangi dari 4px */
          background: rgba(10, 251, 255, 0.1);
          border-radius: 1px; /* Dikurangi dari 2px */
          overflow: hidden;
          margin-bottom: 8px; /* Dikurangi dari 10px */
        }

        .cyber-loading-progress {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #0066ff, #0afbff);
          border-radius: 1px; /* Dikurangi dari 2px */
          animation: loading 2.5s ease-in-out forwards;
          will-change: width;
        }

        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        .loading-status {
          display: flex;
          justify-content: center;
        }

        .loading-message {
          font-size: 0.75rem; /* Dikurangi dari 0.8rem */
          color: rgba(10, 251, 255, 0.7);
          letter-spacing: 0.4px; /* Dikurangi dari 0.5px */
        }

        .action-section {
          display: flex;
          flex-direction: column;
          gap: 12px; /* Dikurangi dari 15px */
          width: 100%;
          transition: opacity 0.3s ease;
          position: absolute;
          top: 0;
          left: 0;
        }

        .main-cyber-button {
          position: relative;
          padding: 10px 18px; /* Dikurangi dari 14px 24px */
          border: none;
          border-radius: 3px; /* Dikurangi dari 4px */
          font-family: 'Orbitron', sans-serif;
          font-size: 0.85rem; /* Dikurangi dari 0.95rem */
          font-weight: 600;
          letter-spacing: 0.8px; /* Dikurangi dari 1px */
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px; /* Dikurangi dari 8px */
          overflow: hidden;
          background: linear-gradient(135deg, #0066ff, #0afbff);
          color: #0a0a1a;
          box-shadow: 0 0 10px rgba(0, 102, 255, 0.5); /* Dikurangi dari 12px */
          will-change: transform, box-shadow;
        }

        .main-cyber-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 16px rgba(0, 102, 255, 0.8); /* Dikurangi dari 20px */
        }

        .main-cyber-button:active {
          transform: translateY(0);
        }

        .button-icon {
          font-size: 0.9rem; /* Dikurangi dari 1rem */
        }

        .button-text {
          font-weight: 600;
        }

        .alternative-option {
          cursor: pointer;
          padding: 8px; /* Dikurangi dari 10px */
          border-radius: 2px; /* Dikurangi dari 3px */
          transition: background 0.2s ease;
        }

        .alternative-option:hover {
          background: rgba(10, 251, 255, 0.08);
        }

        .alternative-text {
          font-size: 0.75rem; /* Dikurangi dari 0.85rem */
          color: rgba(10, 251, 255, 0.7);
          display: block;
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
          .splash-content {
            padding: 15px 12px; /* Dikurangi dari 20px 15px */
            gap: 20px; /* Dikurangi dari 30px */
            max-width: 100%;
          }

          .title-section {
            min-height: 50px; /* Dikurangi dari 70px */
            margin-bottom: 5px; /* Dikurangi dari 10px */
          }

          .cyber-title {
            font-size: 1.5rem; /* Dikurangi dari 1.7rem */
            min-height: 40px; /* Dikurangi dari 50px */
            height: 40px;
            letter-spacing: 1.2px; /* Dikurangi dari 1.5px */
          }

          .interactive-section {
            max-width: 240px; /* Dikurangi dari 280px */
            min-height: 80px; /* Dikurangi dari 110px */
          }

          .main-cyber-button {
            padding: 9px 16px; /* Dikurangi dari 12px 20px */
            font-size: 0.8rem; /* Dikurangi dari 0.9rem */
          }

          .alternative-text {
            font-size: 0.7rem; /* Dikurangi dari 0.8rem */
          }
        }

        @media (max-width: 360px) {
          .cyber-title {
            font-size: 1.3rem; /* Dikurangi dari 1.5rem */
            letter-spacing: 1px;
          }

          .splash-content {
            gap: 18px; /* Dikurangi dari 25px */
          }

          .interactive-section {
            max-width: 220px; /* Dikurangi dari 260px */
          }
        }

        /* Untuk device yang sangat kecil */
        @media (max-height: 600px) {
          .splash-content {
            gap: 15px; /* Dikurangi dari 20px */
          }
          
          .title-section {
            min-height: 50px; /* Dikurangi dari 60px */
          }
          
          .cyber-title {
            font-size: 1.2rem; /* Dikurangi dari 1.4rem */
            min-height: 35px; /* Dikurangi dari 40px */
            height: 35px;
          }
          
          .interactive-section {
            min-height: 70px; /* Dikurangi dari 100px */
          }
        }
        `}
      </style>
    </div>
  );
};

export default SplashScreen;