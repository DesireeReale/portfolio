import { useEffect, useRef } from 'react';

// Sfondo a particelle: puntini che fluttuano piano. Canvas nativo, nessuna dipendenza.
export default function ParticleField({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const count = Math.min(120, Math.round((w * h) / 13000));
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: rand(-0.22, 0.22), vy: rand(-0.22, 0.22),
      r: rand(0.7, 2.0), a: rand(0.1, 0.38),
    }));

    // ponytail: link check è O(n^2), va benissimo fino a ~120 punti
    const LINK = 130;
    const draw = () => {
      // il canvas dipinge lo sfondo della pagina, così le particelle non finiscono coperte
      ctx.fillStyle = isDark ? '#020617' : '#fafaf9';
      ctx.fillRect(0, 0, w, h);
      const rgb = isDark ? '56, 189, 248' : '99, 102, 241';
      // linee di collegamento tra punti vicini
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(${rgb}, ${(1 - dist / LINK) * (isDark ? 0.11 : 0.08)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      for (const d of dots) {
        if (!reduced) {
          d.x += d.vx; d.y += d.vy;
          if (d.x < 0) d.x = w; else if (d.x > w) d.x = 0;
          if (d.y < 0) d.y = h; else if (d.y > h) d.y = 0;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${d.a * (isDark ? 1.5 : 1.0)})`;
        ctx.fill();
      }
    };

    let raf = 0;
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    if (reduced) draw(); else loop();

    const onResize = () => { resize(); };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      aria-hidden="true"
    />
  );
}
