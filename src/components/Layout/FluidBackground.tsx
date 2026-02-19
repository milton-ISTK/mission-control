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
// Fluid Background — Dark Lava Veins
// ==========================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
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
    // Fewer, subtler particles
    const count = Math.min(25, Math.floor((width * height) / 80000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        life: Math.random() * 300,
        maxLife: 300 + Math.random() * 400,
        size: 0.5 + Math.random() * 1,
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
      timeRef.current += 0.002; // Slower animation
      const t = timeRef.current;
      const mouse = mouseRef.current;

      // Render at 25% resolution for performance
      const scale = 0.25;
      const rw = Math.floor(width * scale);
      const rh = Math.floor(height * scale);

      const imgData = ctx.createImageData(rw, rh);
      const data = imgData.data;

      // Lava vein field — dark stone with glowing cracks
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          const wx = x / scale;
          const wy = y / scale;

          const nx = x / rw;
          const ny = y / rh;

          // === Vein pattern using ridged noise ===
          // Multiple noise layers at different scales for vein networks
          const n1 = noise.fbm(nx * 4 + t * 0.3, ny * 4 + t * 0.15, 4, 2.0, 0.5);
          const n2 = noise.fbm(nx * 7 - t * 0.2, ny * 7 + t * 0.1, 3, 2.0, 0.45);
          const n3 = noise.fbm(nx * 2.5 + t * 0.08, ny * 2.5 - t * 0.04, 2, 2.0, 0.6);

          // Ridged noise: 1 - abs(noise) creates vein-like ridges where noise crosses zero
          const ridge1 = Math.pow(1 - Math.abs(n1), 6); // Sharp veins
          const ridge2 = Math.pow(1 - Math.abs(n2), 8); // Thinner detail veins
          const ridge3 = Math.pow(1 - Math.abs(n3), 4); // Broad subtle glow

          // Combine: primary veins + detail veins + broad warmth
          let veinIntensity = ridge1 * 0.6 + ridge2 * 0.25 + ridge3 * 0.15;

          // Mouse interaction — subtle ripple in veins near cursor
          if (mouse.active) {
            const dx = (wx - mouse.x) / width;
            const dy = (wy - mouse.y) / height;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseInfluence = Math.max(0, 1 - dist * 5);
            // Brighten veins near mouse
            veinIntensity += mouseInfluence * 0.25;
            // Add subtle ripple
            const ripple = Math.sin(dist * 50 - t * 10) * 0.5 + 0.5;
            veinIntensity += mouseInfluence * ripple * 0.08;
          }

          // Clamp
          veinIntensity = Math.max(0, Math.min(1, veinIntensity));

          const idx = (y * rw + x) * 4;

          // === Color mapping: very dark base → orange/red veins ===
          // Base: deep charcoal (#080808 to #0C0C0C)
          // Veins: #FF4500 → #FF6B00 (deep red-orange to tangerine)

          if (veinIntensity < 0.05) {
            // Pure dark stone — near black
            data[idx] = 8;      // R
            data[idx + 1] = 8;  // G
            data[idx + 2] = 9;  // B
            data[idx + 3] = 255;
          } else if (veinIntensity < 0.15) {
            // Faint warm hint — barely visible
            const f = (veinIntensity - 0.05) / 0.10;
            data[idx] = Math.floor(8 + f * 18);     // R: subtle warmth
            data[idx + 1] = Math.floor(8 + f * 4);  // G
            data[idx + 2] = Math.floor(9 + f * 2);  // B
            data[idx + 3] = 255;
          } else if (veinIntensity < 0.35) {
            // Deep ember glow — dark red/orange starting to show
            const f = (veinIntensity - 0.15) / 0.20;
            data[idx] = Math.floor(26 + f * 80);    // R ramps
            data[idx + 1] = Math.floor(12 + f * 15); // G slight
            data[idx + 2] = Math.floor(11 - f * 6);  // B fades
            data[idx + 3] = 255;
          } else if (veinIntensity < 0.55) {
            // Main vein color — deep orange (#FF4500 range)
            const f = (veinIntensity - 0.35) / 0.20;
            data[idx] = Math.floor(106 + f * 100);   // R: 106→206
            data[idx + 1] = Math.floor(27 + f * 40); // G: 27→67
            data[idx + 2] = Math.floor(5 + f * 2);   // B: minimal
            data[idx + 3] = 255;
          } else if (veinIntensity < 0.75) {
            // Bright vein core — tangerine (#FF6B00)
            const f = (veinIntensity - 0.55) / 0.20;
            data[idx] = Math.floor(206 + f * 49);    // R: 206→255
            data[idx + 1] = Math.floor(67 + f * 40); // G: 67→107
            data[idx + 2] = Math.floor(7 + f * 3);   // B
            data[idx + 3] = 255;
          } else {
            // Hottest vein center — bright orange-yellow (rare, thin peaks)
            const f = (veinIntensity - 0.75) / 0.25;
            data[idx] = 255;
            data[idx + 1] = Math.floor(107 + f * 60); // G: 107→167
            data[idx + 2] = Math.floor(10 + f * 30);  // B: slight warmth
            data[idx + 3] = 255;
          }
        }
      }

      // Draw scaled lava to canvas
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = rw;
      tempCanvas.height = rh;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.putImageData(imgData, 0, 0);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(tempCanvas, 0, 0, rw, rh, 0, 0, width, height);

      // ---- Subtle glow spots (much dimmer than before) ----
      const glowSpots = [
        { x: 0.15, y: 0.25, r: 0.3, color: "rgba(255,107,0,", base: 0.008, pulse: 0.005 },
        { x: 0.8, y: 0.7, r: 0.35, color: "rgba(255,69,0,", base: 0.006, pulse: 0.004 },
        { x: 0.5, y: 0.5, r: 0.4, color: "rgba(255,80,0,", base: 0.004, pulse: 0.003 },
      ];

      glowSpots.forEach((spot, i) => {
        const p = Math.sin(t * (1.2 + i * 0.3) + i * 1.7) * 0.5 + 0.5;
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

      // ---- Mouse glow overlay (subtle) ----
      if (mouse.active) {
        const grd = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 200
        );
        grd.addColorStop(0, "rgba(255,107,0,0.04)");
        grd.addColorStop(0.5, "rgba(255,107,0,0.015)");
        grd.addColorStop(1, "rgba(255,107,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }

      // ---- Subtle ember particles ----
      const particles = particlesRef.current;
      particles.forEach((p) => {
        p.life++;
        if (p.life > p.maxLife) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.life = 0;
          p.maxLife = 300 + Math.random() * 400;
        }

        // Drift with noise
        const pnx = p.x / width;
        const pny = p.y / height;
        const angle = noise.noise2D(pnx * 2 + t, pny * 2 + t) * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.01;
        p.vy += Math.sin(angle) * 0.01;

        // Mouse attraction (gentle)
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (1 - dist / 200) * 0.015;
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
        alpha *= 0.25; // Much dimmer particles

        // Draw — tiny warm ember
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        grd.addColorStop(0, `rgba(255,120,20,${alpha * 0.6})`);
        grd.addColorStop(0.5, `rgba(255,90,0,${alpha * 0.15})`);
        grd.addColorStop(1, `rgba(255,90,0,0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(p.x - p.size * 3, p.y - p.size * 3, p.size * 6, p.size * 6);

        // Tiny bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,180,80,${alpha * 0.5})`;
        ctx.fill();
      });

      // ---- Vignette overlay for depth ----
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, height * 0.25,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.5)");
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
