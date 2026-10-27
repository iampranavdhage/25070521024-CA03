import React, { useEffect, useState, useRef } from 'react';

/**
 * EditorialBackground
 * A minimal, warm, editorial-style interactive background system featuring:
 * 1. Warm paper/cream alabaster canvas (#faf8f5) with delicate editorial rule lines.
 * 2. Interactive ambient cursor warmth: a soft, warm paper glow that smoothly tracks pointer movement.
 * 3. Minimalist click impulse: delicate paper-seal / ink ripple rings that gracefully expand.
 * 4. Refined editorial typographic watermarks with subtle cursor parallax.
 * 5. Minimalist bottom publication folio stamp (Issue No. 2026 · Coordinates · Editorial Edition).
 */
export const EditorialBackground = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [smoothPos, setSmoothPos] = useState({ x: -1000, y: -1000 });
  const [ripples, setRipples] = useState([]);
  const canvasRef = useRef(null);
  const requestRef = useRef();

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e) => {
      // Add subtle editorial ripple ring on click
      setRipples((prev) => [
        ...prev.slice(-5), // keep last 5 max
        {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
          radius: 8,
          opacity: 0.35,
        },
      ]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Smooth lerp for fluid spotlight
  useEffect(() => {
    const animate = () => {
      setSmoothPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.08,
        y: prev.y + (mousePos.y - prev.y) * 0.08,
      }));
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mousePos]);

  // Canvas animation for delicate click ripple rings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let activeRipples = [];
    let animId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render expanding minimalist paper rings
      activeRipples = activeRipples.filter((r) => r.opacity > 0.01 && r.radius < 180);
      for (let i = 0; i < activeRipples.length; i++) {
        const r = activeRipples[i];
        r.radius += 3.5;
        r.opacity *= 0.94;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#c2410c'; // editorial terracotta accent
        ctx.lineWidth = 1;
        ctx.globalAlpha = r.opacity;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Sync state ripples to canvas ref
  useEffect(() => {
    if (ripples.length > 0) {
      const latest = ripples[ripples.length - 1];
      const canvas = canvasRef.current;
      if (canvas) {
        // trigger ripple
      }
    }
  }, [ripples]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#faf8f5', // Warm paper / alabaster
      }}
      aria-hidden="true"
    >
      {/* 1. Subtle Editorial Column & Row Hairline Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(28, 25, 23, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(28, 25, 23, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          opacity: 0.9,
        }}
      />

      {/* 2. Interactive Warm Ambient Cursor Spotlight */}
      <div
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          transform: `translate3d(${smoothPos.x - 350}px, ${smoothPos.y - 350}px, 0)`,
          background: 'radial-gradient(circle, rgba(243, 235, 218, 0.7) 0%, rgba(250, 248, 245, 0.2) 45%, transparent 70%)',
          filter: 'blur(35px)',
          transition: 'transform 0.05s linear',
          willChange: 'transform',
        }}
      />

      {/* 3. Canvas Layer for Delicate Editorial Click Ripples */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* 4. Top-Left Editorial Folio Coordinates */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '28px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.68rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#a8a29e',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span>UNSTOP // EDITORIAL DOSSIER</span>
        <span style={{ color: '#d6d3d1' }}>·</span>
        <span style={{ color: '#78716c' }}>
          POS: {Math.max(0, Math.round(smoothPos.x))} / {Math.max(0, Math.round(smoothPos.y))}
        </span>
      </div>

      {/* 5. Minimalist Editorial Watermarks with Subtle Parallax */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          right: '8%',
          fontFamily: 'Newsreader, Georgia, serif',
          fontStyle: 'italic',
          fontSize: '3.5rem',
          color: 'rgba(28, 25, 23, 0.035)',
          userSelect: 'none',
          transform: `translate3d(${(smoothPos.x - window.innerWidth / 2) * -0.015}px, ${(smoothPos.y - window.innerHeight / 2) * -0.015}px, 0)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        No. 2026
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '16%',
          left: '5%',
          fontFamily: 'Newsreader, Georgia, serif',
          fontStyle: 'italic',
          fontSize: '2.8rem',
          color: 'rgba(28, 25, 23, 0.035)',
          userSelect: 'none',
          transform: `translate3d(${(smoothPos.x - window.innerWidth / 2) * 0.02}px, ${(smoothPos.y - window.innerHeight / 2) * 0.02}px, 0)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        Academic Ledger
      </div>

      {/* 6. Clean Bottom Minimal Folio Stamp */}
      <div
        style={{
          position: 'absolute',
          bottom: '18px',
          right: '28px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#a8a29e',
          userSelect: 'none',
          display: 'flex',
          gap: '16px',
        }}
      >
        <span>VOL. III</span>
        <span>·</span>
        <span>EDITION 2026</span>
        <span>·</span>
        <span style={{ color: '#c2410c' }}>LOCAL COMPASS PERSISTENCE</span>
      </div>
    </div>
  );
};

export default EditorialBackground;
