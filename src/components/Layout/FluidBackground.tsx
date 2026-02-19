"use client";

import { useEffect, useRef, useCallback } from "react";

// ==========================================
// Simplex Noise Implementation (inline)
// ==========================================

class SimplexNoise {
  private grad3: number[][] = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
  ];
  private perm: number[] = [];
  private permMod12: number[] = [];

  constructor(seed = Math.random()) {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    // Seed-based shuffle
    let s = seed * 65536;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0.5) % 2147483647;
      const j = Math.floor((s / 2147483647) * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }

  noise2D(xin: number, yin: number): number {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;

    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1: number, j1: number;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let n0 = 0, n1 = 0, n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      const gi0 = this.permMod12[ii + this.perm[jj]];
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }

  // Fractional Brownian Motion for richer noise
  fbm(x: number, y: number, octaves = 4, lacunarity = 2.0, gain = 0.5): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2D(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }
    return value / maxValue;
  }
}

// ==========================================
// Fluid Background Component
// ==========================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animFrameRef = useRef<number>(0);
  const noiseRef = useRef(new SimplexNoise(42));
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    const count = Math.min(60, Math.floor((width * height) / 25000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 300,
        size: 1 + Math.random() * 2,
        hue: Math.random() > 0.7 ? 200 : 25 + Math.random() * 15, // mostly orange, some cyan
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const noise = noiseRef.current;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles(width, height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // ---- Main render loop ----
    const render = () => {
      timeRef.current += 0.003;
      const t = timeRef.current;
      const mouse = mouseRef.current;

      // Render at half resolution for performance, then scale
      const scale = 0.25; // render at 25% resolution
      const rw = Math.floor(width * scale);
      const rh = Math.floor(height * scale);

      // Create offscreen buffer for lava (if not exists or size changed)
      const imgData = ctx.createImageData(rw, rh);
      const data = imgData.data;

      // Noise-based lava field
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const wx = x / scale;
          const wy = y / scale;

          const nx = x / rw;
          const ny = y / rh;

          // Multi-layer noise for organic lava flow
          const n1 = noise.fbm(nx * 3 + t * 0.4, ny * 3 + t * 0.2, 4, 2.0, 0.5);
          const n2 = noise.fbm(nx * 5 - t * 0.3, ny * 5 + t * 0.15, 3, 2.0, 0.45);
          const n3 = noise.fbm(nx * 1.5 + t * 0.1, ny * 1.5 - t * 0.05, 2, 2.0, 0.6);

          // Combine noise layers
          let intensity = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2 + 1) * 0.5; // normalize to 0-1

          // Mouse interaction — create a warm glow around cursor
          if (mouse.active) {
            const dx = (wx - mouse.x) / width;
            const dy = (wy - mouse.y) / height;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseInfluence = Math.max(0, 1 - dist * 4.5);
            intensity += mouseInfluence * 0.4;

            // Add ripple effect near cursor
            const ripple = Math.sin(dist * 40 - t * 8) * 0.5 + 0.5;
            intensity += mouseInfluence * ripple * 0.15;
          }

          // Clamp
          intensity = Math.max(0, Math.min(1, intensity));

          // Color mapping: charcoal base → orange/red lava → bright white-orange at peak
          const idx = (y * rw + x) * 4;

          // Pulsing base glow
          const pulse = Math.sin(t * 2) * 0.5 + 0.5;
          const basePulse = 0.015 + pulse * 0.01;

          if (intensity < 0.35) {
            // Deep charcoal with slight warm tint
            const f = intensity / 0.35;
            data[idx] = Math.floor(10 + f * 15); // R
            data[idx + 1] = Math.floor(10 + f * 5); // G
            data[idx + 2] = Math.floor(12 + f * 8); // B - slight blue tint in the dark
            data[idx + 3] = 255;
          } else if (intensity < 0.55) {
            // Transition: charcoal → deep orange glow
            const f = (intensity - 0.35) / 0.2;
            data[idx] = Math.floor(25 + f * 100); // R ramps up
            data[idx + 1] = Math.floor(15 + f * 25); // G slight
            data[idx + 2] = Math.floor(20 - f * 15); // B fades
            data[idx + 3] = 255;
          } else if (intensity < 0.72) {
            // Orange lava zone
            const f = (intensity - 0.55) / 0.17;
            data[idx] = Math.floor(125 + f * 130); // R bright
            data[idx + 1] = Math.floor(40 + f * 67); // G rises (orange)
            data[idx + 2] = Math.floor(5 + f * 5); // B minimal
            data[idx + 3] = 255;
          } else if (intensity < 0.85) {
            // Hot orange-yellow
            const f = (intensity - 0.72) / 0.13;
            data[idx] = 255; // R max
            data[idx + 1] = Math.floor(107 + f * 80); // G bright (tangerine)
            data[idx + 2] = Math.floor(10 + f * 30); // B slight warm
            data[idx + 3] = 255;
          } else {
            // Peak: white-hot glow
            const f = (intensity - 0.85) / 0.15;
            data[idx] = 255;
            data[idx + 1] = Math.floor(187 + f * 50);
            data[idx + 2] = Math.floor(40 + f * 120);
            data[idx + 3] = 255;
          }

          // Add subtle cool accent (cyan/blue) in some noise pockets
          const coolNoise = noise.noise2D(nx * 8 + t * 0.5, ny * 8 - t * 0.3);
          if (coolNoise > 0.6 && intensity > 0.3 && intensity < 0.6) {
            const coolF = (coolNoise - 0.6) / 0.4;
            data[idx] = Math.floor(data[idx] * (1 - coolF * 0.4)); // reduce red
            data[idx + 1] = Math.floor(Math.min(255, data[idx + 1] + coolF * 40)); // add green
            data[idx + 2] = Math.floor(Math.min(255, data[idx + 2] + coolF * 100)); // add blue (cyan)
          }
        }
      }

      // Draw scaled lava to canvas
      // Create temp canvas for scaling
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = rw;
      tempCanvas.height = rh;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.putImageData(imgData, 0, 0);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(tempCanvas, 0, 0, rw, rh, 0, 0, width, height);

      // ---- Overlay: large soft glow spots that pulse ----
      const glowSpots = [
        { x: 0.15, y: 0.2, r: 0.35, color: "rgba(255,107,0,", base: 0.03, pulse: 0.02 },
        { x: 0.8, y: 0.7, r: 0.4, color: "rgba(255,69,0,", base: 0.025, pulse: 0.015 },
        { x: 0.5, y: 0.5, r: 0.5, color: "rgba(0,217,255,", base: 0.01, pulse: 0.008 },
        { x: 0.9, y: 0.1, r: 0.25, color: "rgba(178,75,243,", base: 0.015, pulse: 0.01 },
      ];

      glowSpots.forEach((spot, i) => {
        const p = Math.sin(t * (1.5 + i * 0.4) + i * 1.7) * 0.5 + 0.5;
        const alpha = spot.base + p * spot.pulse;
        const grd = ctx.createRadialGradient(
          spot.x * width, spot.y * height, 0,
          spot.x * width, spot.y * height, spot.r * Math.max(width, height)
        );
        grd.addColorStop(0, spot.color + alpha + ")");
        grd.addColorStop(1, spot.color + "0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      });

      // ---- Mouse glow overlay ----
      if (mouse.active) {
        const grd = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 250
        );
        grd.addColorStop(0, "rgba(255,107,0,0.08)");
        grd.addColorStop(0.5, "rgba(255,107,0,0.03)");
        grd.addColorStop(1, "rgba(255,107,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }

      // ---- Sparks / particles ----
      const particles = particlesRef.current;
      particles.forEach((p) => {
        p.life++;
        if (p.life > p.maxLife) {
          // Respawn
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = 0;
          p.maxLife = 200 + Math.random() * 300;
          p.hue = Math.random() > 0.7 ? 200 : 25 + Math.random() * 15;
        }

        // Drift with noise
        const pnx = p.x / width;
        const pny = p.y / height;
        const angle = noise.noise2D(pnx * 2 + t, pny * 2 + t) * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.02;
        p.vy += Math.sin(angle) * 0.02;

        // Mouse attraction
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300) {
            const force = (1 - dist / 300) * 0.03;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Damping
        p.vx *= 0.97;
        p.vy *= 0.97;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Fade in/out
        const lifeRatio = p.life / p.maxLife;
        let alpha = 1;
        if (lifeRatio < 0.1) alpha = lifeRatio / 0.1;
        else if (lifeRatio > 0.8) alpha = (1 - lifeRatio) / 0.2;
        alpha *= 0.6;

        // Draw particle glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        if (p.hue > 100) {
          // Cyan particle
          grd.addColorStop(0, `rgba(0,217,255,${alpha * 0.8})`);
          grd.addColorStop(0.5, `rgba(0,217,255,${alpha * 0.2})`);
          grd.addColorStop(1, `rgba(0,217,255,0)`);
        } else {
          // Orange/warm particle
          grd.addColorStop(0, `rgba(255,140,20,${alpha * 0.9})`);
          grd.addColorStop(0.5, `rgba(255,107,0,${alpha * 0.3})`);
          grd.addColorStop(1, `rgba(255,107,0,0)`);
        }
        ctx.fillStyle = grd;
        ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8);

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        if (p.hue > 100) {
          ctx.fillStyle = `rgba(180,240,255,${alpha * 0.9})`;
        } else {
          ctx.fillStyle = `rgba(255,200,120,${alpha * 0.9})`;
        }
        ctx.fill();
      });

      // ---- Vignette overlay for depth ----
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.3,
        width / 2, height / 2, Math.max(width, height) * 0.75
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
