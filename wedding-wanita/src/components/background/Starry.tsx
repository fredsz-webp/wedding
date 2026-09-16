import React, { useEffect, useRef } from 'react';

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starCount = 100;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Bintang dengan properti lengkap
    const stars = Array.from({ length: starCount }).map(() => {
      const layer = Math.random();
      const depth = 0.3 + layer * 0.7;
      
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        baseSize: 0.5 + Math.random() * 1.5,
        depth,
        dx: (Math.random() - 0.5) * 0.3 * depth,
        dy: (Math.random() - 0.5) * 0.3 * depth,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.0008 + Math.random() * 0.0012,
        brightness: 0.6 + Math.random() * 0.4,
        pushVelX: 0,
        pushVelY: 0,
      };
    });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Function untuk deteksi bintang yang tersentuh/diklik
    const pushStarsAway = (x: number, y: number) => {
      const pushRadius = 40; // radius area yang terpengaruh (diperkecil)
      const pushForce = 1.5; // kekuatan dorongan (sangat lambat)
      
      stars.forEach(star => {
        const dx = star.x - x;
        const dy = star.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < pushRadius && distance > 0) {
          // Hitung arah dorongan (menjauh dari titik sentuh)
          const angle = Math.atan2(dy, dx);
          const force = (1 - distance / pushRadius) * pushForce;
          
          star.pushVelX += Math.cos(angle) * force * star.depth;
          star.pushVelY += Math.sin(angle) * force * star.depth;
        }
      });
    };

    // Mouse handlers
    const onMouseDown = (e: MouseEvent) => {
      pushStarsAway(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      // Bintang ikut gerak saat kursor bergerak (tanpa perlu klik)
      pushStarsAway(e.clientX, e.clientY);
    };

    // Touch handlers
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        pushStarsAway(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        pushStarsAway(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now();

      for (const star of stars) {
        // Apply velocity dari push
        star.x += star.pushVelX;
        star.y += star.pushVelY;
        
        // Friction untuk smooth stop
        star.pushVelX *= 0.97;
        star.pushVelY *= 0.97;
        
        // Gerakan natural bintang
        star.x += star.dx;
        star.y += star.dy;

        // Wrap around
        if (star.x < -10) star.x = canvas.width + 10;
        if (star.x > canvas.width + 10) star.x = -10;
        if (star.y < -10) star.y = canvas.height + 10;
        if (star.y > canvas.height + 10) star.y = -10;

        // Twinkle effect
        const twinkle = Math.sin(star.twinklePhase + time * star.twinkleSpeed);
        const opacity = star.brightness * (0.4 + twinkle * 0.3);
        
        const size = star.baseSize * star.depth;
        
        ctx.globalAlpha = opacity;
        
        // Gradient glow
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, size * 2
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 2, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Core bintang
        ctx.globalAlpha = opacity * 1.2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, size * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

   return (
  <canvas
    ref={canvasRef}
    className="fixed top-0 left-0 w-full h-full pointer-events-all"
    style={{
      background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1a2e 100%)',
      cursor: 'crosshair',
    }}
  />
);

};

export default StarryBackground;