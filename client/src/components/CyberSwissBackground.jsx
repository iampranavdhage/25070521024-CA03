import React, { useEffect, useState, useRef } from 'react';

/**
 * CyberSwissBackground
 * An interactive Y2K + Swiss international background system featuring:
 * 1. Interactive HTML5 Canvas cyber-particle constellation that reacts to cursor proximity & clicks.
 * 2. Smooth Lerp cursor neon spotlight with multi-chromatic glow.
 * 3. High-precision Swiss typographic coordinates and technical telemetry HUD.
 * 4. Interactive Theme Mode switch (Cyber Cyan, Acid Matrix, Sunset Fuchsia).
 * 5. Dynamic click shockwave ripples.
 * 6. Non-obtrusive architecture (zero interference with main page clicks).
 */
export const CyberSwissBackground = () => {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [smoothPos, setSmoothPos] = useState({ x: -1000, y: -1000 });
  const [themeMode, setThemeMode] = useState('CYBER_CYAN'); // 'CYBER_CYAN' | 'ACID_MATRIX' | 'SUNSET_FUCHSIA'
  const [fps, setFps] = useState(60);
  const [clickCount, setClickCount] = useState(0);

  const requestRef = useRef();
  const particlesRef = useRef([]);
  const ripplesRef = useRef([]);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Palette definitions
  const palettes = {
    CYBER_CYAN: {
      primary: '#00f0ff',
      secondary: '#a855f7',
      accent: '#ec4899',
      glow: 'rgba(0, 240, 255, 0.18)',
      spotlight: 'radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, rgba(0, 240, 255, 0.1) 40%, transparent 70%)',
    },
    ACID_MATRIX: {
      primary: '#10e78c',
      secondary: '#00f0ff',
      accent: '#facc15',
      glow: 'rgba(16, 231, 140, 0.18)',
      spotlight: 'radial-gradient(circle, rgba(16, 231, 140, 0.16) 0%, rgba(0, 240, 255, 0.08) 40%, transparent 70%)',
    },
    SUNSET_FUCHSIA: {
      primary: '#ff007f',
      secondary: '#a855f7',
      accent: '#fb923c',
      glow: 'rgba(255, 0, 127, 0.18)',
      spotlight: 'radial-gradient(circle, rgba(255, 0, 127, 0.16) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 70%)',
    },
  };

  const currentTheme = palettes[themeMode] || palettes.CYBER_CYAN;

  // Initialize and track mouse & click ripples
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e) => {
      setClickCount((c) => c + 1);
      // Spawn expanding shockwave ripple at click coordinates
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 180,
        opacity: 0.8,
        color: currentTheme.primary,
      });

      // Also gently boost nearby particles
      if (particlesRef.current.length > 0) {
        particlesRef.current.forEach((p) => {
          const dx = p.x - e.clientX;
          const dy = p.y - e.clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const force = (220 - dist) / 220;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 5;
            p.vy += Math.sin(angle) * force * 5;
          }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [currentTheme]);

  // Canvas particle matrix simulation
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
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    const initParticles = () => {
      const count = Math.min(55, Math.floor((width * height) / 22000));
      const p = [];
      for (let i = 0; i < count; i++) {
        p.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          size: Math.random() * 2 + 1.2,
          baseColor: Math.random() > 0.5 ? currentTheme.primary : currentTheme.secondary,
        });
      }
      particlesRef.current = p;
    };

    initParticles();

    // Animation Loop
    let animId;
    const render = (time) => {
      // FPS measurement
      frameCountRef.current++;
      if (time - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (time - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      setSmoothPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.08,
        y: prev.y + (mousePos.y - prev.y) * 0.08,
      }));

      // Render & update click shockwaves
      const activeRipples = [];
      for (let i = 0; i < ripplesRef.current.length; i++) {
        const rip = ripplesRef.current[i];
        rip.radius += 4;
        rip.opacity *= 0.94;

        if (rip.opacity > 0.02 && rip.radius < rip.maxRadius) {
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.strokeStyle = rip.color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = rip.opacity;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
          activeRipples.push(rip);
        }
      }
      ripplesRef.current = activeRipples;

      // Update and draw particles
      const particles = particlesRef.current;
      const mouse = mousePos;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        // Friction back to gentle pace
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Proximity reaction to mouse cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140 && dist > 0) {
          // Subtle magnetic repel
          const repelForce = ((140 - dist) / 140) * 0.8;
          p.vx += (dx / dist) * repelForce;
          p.vy += (dy / dist) * repelForce;

          // Connect cursor to particle with glowing cyber line
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = currentTheme.primary;
          ctx.globalAlpha = (1 - dist / 140) * 0.35;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = dist < 140 ? currentTheme.primary : p.baseColor;
        ctx.shadowColor = currentTheme.primary;
        ctx.shadowBlur = dist < 140 ? 10 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles to form constellations
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 105) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = currentTheme.secondary;
            ctx.globalAlpha = (1 - cdist / 105) * 0.15;
            ctx.lineWidth = 0.75;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePos, currentTheme]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* 1. Swiss International Grid Matrix Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.8,
        }}
      />

      {/* 2. Interactive Canvas for Particles, Constellations, and Shockwaves */}
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

      {/* 3. Interactive Cursor Spotlight (Y2K Multi-chromatic Neon Glow) */}
      <div
        style={{
          position: 'absolute',
          width: '640px',
          height: '640px',
          borderRadius: '50%',
          transform: `translate3d(${smoothPos.x - 320}px, ${smoothPos.y - 320}px, 0)`,
          background: currentTheme.spotlight,
          filter: 'blur(40px)',
          transition: 'transform 0.06s linear, background 0.4s ease',
          willChange: 'transform',
        }}
      />

      {/* 4. Swiss Architectural Top Left HUD & Live Pointer Coordinates */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.68rem',
          color: 'rgba(255, 255, 255, 0.35)',
          letterSpacing: '0.12em',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span>+ GRID.SYS // CH-2026</span>
        <span style={{ color: currentTheme.primary, fontWeight: 700 }}>
          XY: [{Math.max(0, Math.round(smoothPos.x))}, {Math.max(0, Math.round(smoothPos.y))}]
        </span>
        <span style={{ color: '#64748b' }}>FPS: {fps}</span>
      </div>

      {/* 5. Floating Interactive Y2K Parallax Glyphs */}
      <div
        style={{
          position: 'absolute',
          top: '16%',
          right: '10%',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.6rem',
          color: currentTheme.secondary,
          opacity: 0.28,
          transform: `translate3d(${(smoothPos.x - window.innerWidth / 2) * -0.025}px, ${(smoothPos.y - window.innerHeight / 2) * -0.025}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        ✦
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '6%',
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.4rem',
          color: currentTheme.primary,
          opacity: 0.3,
          transform: `translate3d(${(smoothPos.x - window.innerWidth / 2) * 0.035}px, ${(smoothPos.y - window.innerHeight / 2) * 0.035}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        ✱
      </div>

      <div
        style={{
          position: 'absolute',
          top: '55%',
          right: '18%',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.72rem',
          color: currentTheme.accent,
          border: `1px solid ${currentTheme.accent}`,
          padding: '2px 8px',
          opacity: 0.35,
          transform: `translate3d(${(smoothPos.x - window.innerWidth / 2) * -0.015}px, ${(smoothPos.y - window.innerHeight / 2) * -0.015}px, 0)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        [NODE.MATRIX // PERSIST]
      </div>

      {/* 6. Subtle CRT Scanline Filter */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(18, 16, 26, 0) 50%, rgba(0, 0, 0, 0.22) 50%)',
          backgroundSize: '100% 4px',
          opacity: 0.25,
        }}
      />

      {/* 7. Interactive Bottom-Left Floating Cyber HUD Widget (User can click) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '24px',
          pointerEvents: 'auto', // Allows user interaction!
          background: 'rgba(8, 8, 14, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '8px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          color: '#94a3b8',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: currentTheme.primary,
              boxShadow: `0 0 10px ${currentTheme.primary}`,
            }}
          />
          <span style={{ color: '#ffffff', fontWeight: 600 }}>INTERACTIVE HUD</span>
        </div>

        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

        {/* Theme mode clickable toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#64748b' }}>PALETTE:</span>
          <button
            onClick={() => {
              const modes = ['CYBER_CYAN', 'ACID_MATRIX', 'SUNSET_FUCHSIA'];
              const nextIndex = (modes.indexOf(themeMode) + 1) % modes.length;
              setThemeMode(modes[nextIndex]);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${currentTheme.primary}`,
              color: currentTheme.primary,
              borderRadius: '4px',
              padding: '2px 8px',
              fontFamily: 'inherit',
              fontSize: '0.68rem',
              cursor: 'pointer',
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
            title="Click to toggle cyber palette"
          >
            {themeMode} ⟳
          </button>
        </div>

        {clickCount > 0 && (
          <>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span style={{ color: currentTheme.accent }}>RIPPLES: {clickCount}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CyberSwissBackground;
