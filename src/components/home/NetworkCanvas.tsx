import React, { useEffect, useRef } from 'react';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface NetworkCanvasProps {
  /** Approximate node count at desktop width; scaled down on narrow screens. */
  density?: number;
  /** Overall strength of the effect (edge/node alpha multiplier). */
  intensity?: number;
  className?: string;
}

interface NetNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: 'cyan' | 'blue';
}

interface Pulse {
  from: number;
  to: number;
  t: number;
  speed: number;
}

const CYAN = '0, 212, 255';
const BLUE = '77, 159, 255';
const LINK_DIST = 150;
const MAX_DPR = 2;

/**
 * The signature "intelligence network" visual: a slow, breathing graph of
 * nodes with voice pulses travelling along edges. Purely decorative —
 * aria-hidden, pointer-events-none, rendered behind real DOM content. Pauses
 * off-screen; renders a single static frame under prefers-reduced-motion.
 */
const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  density = 50,
  intensity = 1,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { ref: wrapRef, inView } = useInView<HTMLDivElement>({ threshold: 0 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes: NetNode[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let lastPulse = 0;

    const seed = () => {
      const scale = Math.min(1, width / 1200);
      const count = Math.max(16, Math.round(density * scale));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1 + Math.random() * 1.8,
        hue: Math.random() < 0.7 ? 'cyan' : 'blue',
      }));
      pulses = [];
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (now: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);

      if (animate) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -10) n.x = width + 10;
          if (n.x > width + 10) n.x = -10;
          if (n.y < -10) n.y = height + 10;
          if (n.y > height + 10) n.y = -10;
        }
      }

      // Edges between nearby nodes.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.16 * intensity;
            ctx.strokeStyle = `rgba(${CYAN}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes with a soft breathing glow.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const breathe = animate ? 0.75 + 0.25 * Math.sin(now / 1600 + i) : 1;
        const color = n.hue === 'cyan' ? CYAN : BLUE;
        ctx.fillStyle = `rgba(${color}, ${0.55 * breathe * intensity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${color}, ${0.08 * breathe * intensity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!animate) return;

      // Voice pulses travelling along edges.
      if (now - lastPulse > 1400 && pulses.length < 4 && nodes.length > 1) {
        lastPulse = now;
        const from = Math.floor(Math.random() * nodes.length);
        let best = -1;
        let bestDist = Infinity;
        for (let j = 0; j < nodes.length; j++) {
          if (j === from) continue;
          const d = Math.hypot(nodes[from].x - nodes[j].x, nodes[from].y - nodes[j].y);
          if (d < bestDist) {
            bestDist = d;
            best = j;
          }
        }
        if (best >= 0 && bestDist < LINK_DIST * 2.2) {
          pulses.push({ from, to: best, t: 0, speed: 0.008 + Math.random() * 0.006 });
        }
      }

      pulses = pulses.filter((p) => p.t <= 1);
      for (const p of pulses) {
        p.t += p.speed;
        const a = nodes[p.from];
        const b = nodes[p.to];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const fade = Math.sin(Math.PI * Math.min(1, p.t));
        ctx.strokeStyle = `rgba(${CYAN}, ${0.25 * fade * intensity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(${CYAN}, ${0.9 * fade * intensity})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      draw(now, true);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced || !inView) draw(0, false);
    });
    ro.observe(wrap);

    if (reduced) {
      // Static, elegant still frame — no looping motion.
      draw(0, false);
    } else if (inView) {
      raf = requestAnimationFrame(loop);
    } else {
      // Off-screen: leave the last frame, no animation work.
      draw(0, false);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, intensity, inView, reduced, wrapRef]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${className}`.trim()}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default NetworkCanvas;
