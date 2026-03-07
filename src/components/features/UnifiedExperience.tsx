import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;

  scatterX: number;
  scatterY: number;
  scatterZ: number;

  heroX: number;
  heroY: number;
  heroZ: number;

  areYouX: number;
  areYouY: number;
  areYouZ: number;

  readyX: number;
  readyY: number;
  readyZ: number;

  color: string;
  size: number;
  opacity: number;
  noiseOffset: number;
  spiralDelay: number;

  wanderAngle: number;
  wanderSpeed: number;
}

interface UnifiedExperienceProps {
  progress: number;
  className?: string;
}

const COLORS = ['#FFFFFF', '#F0F0F0', '#E8E8E8'];

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const UnifiedExperience: React.FC<UnifiedExperienceProps> = ({
  progress,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const entranceProgressRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const prevMouseRef = useRef({ x: -1000, y: -1000 });
  const mouseVelRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };
      mouseVelRef.current = {
        x: mouseRef.current.x - prevMouseRef.current.x,
        y: mouseRef.current.y - prevMouseRef.current.y,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      mouseVelRef.current = { x: 0, y: 0 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    let start: number | null = null;
    const duration = 2500;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const p = Math.min(1, elapsed / duration);
      entranceProgressRef.current = p;
      if (p < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isInitialized]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const init = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (w <= 0 || h <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const sampleScale = 2;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCanvas.width = w * sampleScale;
      tempCanvas.height = h * sampleScale;
      tempCtx.scale(sampleScale, sampleScale);

      // ── 1. Sample "GREATEST MOMENTS IN SPORTS HISTORY" ──────────────
      tempCtx.clearRect(0, 0, w, h);
      tempCtx.fillStyle = 'white';
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      const heroFontSize = Math.min(w * 0.1, 120);
      const heroLines = ['GREATEST MOMENTS', 'IN', 'SPORTS HISTORY'];
      heroLines.forEach((line, i) => {
        const isIn = line === 'IN';
        const size = isIn ? heroFontSize * 0.6 : heroFontSize;
        tempCtx.font = isIn
          ? `italic 600 ${size}px "Playfair Display", Georgia, serif`
          : `900 ${size}px "Inter", "Arial Black", sans-serif`;
        tempCtx.fillText(
          line,
          w / 2,
          h / 2 - heroFontSize * 1.3 + i * heroFontSize * 1.3
        );
      });

      const heroImageData = tempCtx.getImageData(0, 0, w * sampleScale, h * sampleScale);
      const heroPixels = heroImageData.data;
      const heroPoints: { x: number; y: number; brightness: number }[] = [];

      // Slightly larger gap = fewer particles
      const sampleGap = 2;
      const pixelStep = sampleGap * sampleScale;

      for (let py = 0; py < h * sampleScale; py += pixelStep) {
        for (let px = 0; px < w * sampleScale; px += pixelStep) {
          const idx = (py * w * sampleScale + px) * 4;
          const alpha = heroPixels[idx + 3];
          if (alpha > 80) {
            heroPoints.push({
              x: px / sampleScale,
              y: py / sampleScale,
              brightness: alpha / 255,
            });
          }
        }
      }

      // ── 2. Sample "ARE YOU" ────────────────────────────────────
      tempCtx.clearRect(0, 0, w, h);
      const areYouFontSize = Math.min(w * 0.12, 140);
      tempCtx.font = `900 ${areYouFontSize}px "Inter", "Arial Black", sans-serif`;
      tempCtx.fillText('ARE YOU', w / 2, h / 2);

      const areYouImageData = tempCtx.getImageData(0, 0, w * sampleScale, h * sampleScale);
      const areYouPixels = areYouImageData.data;
      const areYouPoints: { x: number; y: number; brightness: number }[] = [];
      for (let py = 0; py < h * sampleScale; py += pixelStep) {
        for (let px = 0; px < w * sampleScale; px += pixelStep) {
          const idx = (py * w * sampleScale + px) * 4;
          const alpha = areYouPixels[idx + 3];
          if (alpha > 80) {
            areYouPoints.push({
              x: px / sampleScale,
              y: py / sampleScale,
              brightness: alpha / 255,
            });
          }
        }
      }

      // ── 3. Sample "READY?" ────────────────────────────────────
      tempCtx.clearRect(0, 0, w, h);
      const readyFontSize = Math.min(w * 0.12, 140);
      tempCtx.font = `900 ${readyFontSize}px "Inter", "Arial Black", sans-serif`;
      tempCtx.fillText('READY?', w / 2, h / 2);

      const readyImageData = tempCtx.getImageData(0, 0, w * sampleScale, h * sampleScale);
      const readyPixels = readyImageData.data;
      const readyPoints: { x: number; y: number; brightness: number }[] = [];
      for (let py = 0; py < h * sampleScale; py += pixelStep) {
        for (let px = 0; px < w * sampleScale; px += pixelStep) {
          const idx = (py * w * sampleScale + px) * 4;
          const alpha = readyPixels[idx + 3];
          if (alpha > 80) {
            readyPoints.push({
              x: px / sampleScale,
              y: py / sampleScale,
              brightness: alpha / 255,
            });
          }
        }
      }

      // ── 4. Build Particles ────────────────────────────────────────────
      const count = Math.max(heroPoints.length, areYouPoints.length, readyPoints.length);
      if (count === 0) return;

      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const heroPt = heroPoints[i % heroPoints.length];
        const areYouPt = areYouPoints[i % areYouPoints.length];
        const readyPt = readyPoints[i % readyPoints.length];

        const scatterX = Math.random() * w;
        const scatterY = Math.random() * h;
        const scatterZ = (Math.random() - 0.5) * 600;

        const spiralDelay = i / count;
        const baseBrightness = heroPt.brightness;

        particles.push({
          x: scatterX,
          y: scatterY,
          z: scatterZ,
          vx: 0,
          vy: 0,
          vz: 0,
          scatterX,
          scatterY,
          scatterZ,
          heroX: heroPt.x,
          heroY: heroPt.y,
          heroZ: 0,
          areYouX: areYouPt.x,
          areYouY: areYouPt.y,
          areYouZ: 0,
          readyX: readyPt.x,
          readyY: readyPt.y,
          readyZ: 0,
          color: `rgba(255, 255, 255, ${0.7 + baseBrightness * 0.3})`,
          size: 0.8 + baseBrightness * 0.4,
          opacity: 1,
          noiseOffset: Math.random() * 1000,
          spiralDelay,
          wanderAngle: Math.random() * Math.PI * 2,
          wanderSpeed: 0.05 + Math.random() * 0.1,
        });
      }

      particlesRef.current = particles;
      setIsInitialized(true);
    };

    init();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, []);

  // ── Animation loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitialized) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      if (w <= 0 || h <= 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const fov = 800;

      // Decay mouse velocity over time for smooth trailing effect
      mouseVelRef.current.x *= 0.95;
      mouseVelRef.current.y *= 0.95;

      particlesRef.current.forEach((p) => {
        let tx: number, ty: number, tz: number;

        // ── State Definitions ─────────────────────────────────────────
        const entrance = entranceProgressRef.current;
        
        // State 0: Hero Text
        const s0x = p.scatterX + (p.heroX - p.scatterX) * entrance;
        const s0y = p.scatterY + (p.heroY - p.scatterY) * entrance;
        const s0z = p.scatterZ + (p.heroZ - p.scatterZ) * entrance;

        // State 1: Distorted Hero Text
        const distortAmount = 200;
        const waveX = Math.sin(p.heroY * 0.02 + p.noiseOffset);
        const waveY = Math.cos(p.heroX * 0.02 + p.noiseOffset);
        const s1x = p.heroX + waveX * distortAmount;
        const s1y = p.heroY + waveY * distortAmount;
        const s1z = p.heroZ + Math.sin(p.noiseOffset * 5) * distortAmount;

        // State 2: Scattered Completely
        const scatterAngle = p.noiseOffset * Math.PI * 2;
        const scatterDist = 600 + Math.sin(p.noiseOffset * 7) * 400;
        const s2x = centerX + Math.cos(scatterAngle) * scatterDist;
        const s2y = centerY + Math.sin(scatterAngle) * scatterDist;
        const s2z = p.scatterZ + Math.cos(p.noiseOffset * 3) * 800;

        // State 3: ARE YOU Text
        const s3x = p.areYouX;
        const s3y = p.areYouY;
        const s3z = p.areYouZ;

        // State 4: Scattered Again
        const finalAngle = p.noiseOffset * Math.PI * 2 * 2;
        const finalDist = 700 + Math.sin(p.noiseOffset * 11) * 500;
        const s4x = centerX + Math.cos(finalAngle) * finalDist;
        const s4y = centerY + Math.sin(finalAngle) * finalDist;
        const s4z = p.scatterZ + Math.sin(p.noiseOffset * 13) * 900;

        // State 5: READY? Text
        const s5x = p.readyX;
        const s5y = p.readyY;
        const s5z = p.readyZ;

        // State 6: Scattered Final
        const finalAngle2 = p.noiseOffset * Math.PI * 2 * 3;
        const finalDist2 = 800 + Math.sin(p.noiseOffset * 17) * 600;
        const s6x = centerX + Math.cos(finalAngle2) * finalDist2;
        const s6y = centerY + Math.sin(finalAngle2) * finalDist2;
        const s6z = p.scatterZ + Math.sin(p.noiseOffset * 19) * 1000;

        // ── Phase Interpolation ───────────────────────────────────────
        if (progress < 0.10) {
          // Hold Hero
          tx = s0x; ty = s0y; tz = s0z;
        } else if (progress < 0.25) {
          // Distort and scatter to "ARE YOU"
          const t = (progress - 0.10) / 0.15;
          const ease = t * t * (3 - 2 * t);
          tx = s0x + (s3x - s0x) * ease;
          ty = s0y + (s3y - s0y) * ease;
          tz = s0z + (s3z - s0z) * ease;
          // Add some distortion in the middle
          tx += (s1x - p.heroX) * Math.sin(ease * Math.PI);
          ty += (s1y - p.heroY) * Math.sin(ease * Math.PI);
          tz += (s1z - p.heroZ) * Math.sin(ease * Math.PI);
        } else if (progress < 0.35) {
          // Hold "ARE YOU"
          tx = s3x; ty = s3y; tz = s3z;
        } else if (progress < 0.45) {
          // Scatter 2
          const t = (progress - 0.35) / 0.10;
          const ease = t * t * (3 - 2 * t);
          tx = s3x + (s4x - s3x) * ease;
          ty = s3y + (s4y - s3y) * ease;
          tz = s3z + (s4z - s3z) * ease;
        } else if (progress < 0.55) {
          // Hold Scatter 2
          tx = s4x; ty = s4y; tz = s4z;
        } else if (progress < 0.65) {
          // Form "READY?"
          const t = (progress - 0.55) / 0.10;
          const adjustedT = Math.max(0, Math.min(1, (t - p.spiralDelay * 0.2) / 0.8));
          const ease = adjustedT * adjustedT * (3 - 2 * adjustedT);
          
          const spiralTurns = 1;
          const currentAngle = (1 - ease) * Math.PI * 2 * spiralTurns + p.noiseOffset;
          const radius = (1 - ease) * Math.min(w, h) * 0.3;
          
          tx = s4x + (s5x - s4x) * ease + Math.cos(currentAngle) * radius;
          ty = s4y + (s5y - s4y) * ease + Math.sin(currentAngle) * radius;
          tz = s4z + (s5z - s4z) * ease;
        } else if (progress < 0.75) {
          // Hold "READY?"
          tx = s5x; ty = s5y; tz = s5z;
        } else if (progress < 0.85) {
          // Scatter 3
          const t = (progress - 0.75) / 0.10;
          const ease = t * t * (3 - 2 * t);
          tx = s5x + (s6x - s5x) * ease;
          ty = s5y + (s6y - s5y) * ease;
          tz = s5z + (s6z - s5z) * ease;
        } else {
          // Hold Scatter 3
          tx = s6x; ty = s6y; tz = s6z;
        }

        // ── Physics spring ────────────────────────────────────────────
        const dx = tx - p.x;
        const dy = ty - p.y;
        const dz = tz - p.z;
        const distToTarget = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // ── Mouse Repulsion — Grain/Sand Explosion ────────────────────
        const mdx = p.x - mouseRef.current.x;
        const mdy = p.y - mouseRef.current.y;
        const mdistSq = mdx * mdx + mdy * mdy;
        const mrange = 60; // Decreased radius so it feels more precise and less disruptive to text
        const mrangeSq = mrange * mrange;
        let isMouseAffected = false;

        if (mdistSq < mrangeSq && mdistSq > 0.01) {
          isMouseAffected = true;
        }

        let stiffness: number;
        let damping: number;

        if (isMouseAffected) {
          damping = 0.95;
          stiffness = 0.01;
        } else if (progress < 0.10 || (progress >= 0.25 && progress < 0.35) || (progress >= 0.65 && progress < 0.75)) {
          // Holding formed text
          stiffness = distToTarget < 2 ? 0.5 : 0.15;
          damping = distToTarget < 1 ? 0.1 : 0.6;
        } else if (progress >= 0.10 && progress < 0.25) {
          // Transition to "ARE YOU"
          const t = (progress - 0.10) / 0.15;
          if (t > 0.8 && distToTarget < 5) {
            stiffness = 0.5;
            damping = 0.2;
          } else {
            stiffness = 0.05;
            damping = 0.8;
          }
        } else if (progress >= 0.55 && progress < 0.65) {
          // Transition to "READY?"
          const t = (progress - 0.55) / 0.10;
          if (t > 0.8 && distToTarget < 5) {
            stiffness = 0.5;
            damping = 0.2;
          } else {
            stiffness = 0.05;
            damping = 0.8;
          }
        } else {
          // Scattering phases
          stiffness = 0.02;
          damping = 0.9;
        }

        if (isMouseAffected) {
          const mdist = Math.sqrt(mdistSq);
          const force = 1 - (mdist / mrange); // Linear falloff is softer

          // Calculate mouse speed for velocity-dependent scattering
          const mouseSpeed = Math.sqrt(
            mouseVelRef.current.x * mouseVelRef.current.x +
            mouseVelRef.current.y * mouseVelRef.current.y
          );

          if (mouseSpeed > 0.5) {
            // Randomize push strength heavily so they scatter unevenly
            const speedFactor = Math.min(mouseSpeed, 20) * 0.2;
            const pushStrength = (Math.random() * 10 + 2) * force * speedFactor;

            // Scatter direction: mostly away from mouse, but with high randomness
            const baseAngle = Math.atan2(mdy, mdx);
            const scatterAngle = baseAngle + (Math.random() - 0.5) * Math.PI;

            p.vx += Math.cos(scatterAngle) * pushStrength;
            p.vy += Math.sin(scatterAngle) * pushStrength;
            p.vz += (Math.random() - 0.5) * pushStrength * 2;

            // Transfer some mouse velocity directly (like wind sweeping them)
            p.vx += mouseVelRef.current.x * force * 0.15 * Math.random();
            p.vy += mouseVelRef.current.y * force * 0.15 * Math.random();
          } else {
            // Gentle random drift when mouse is still over them
            p.vx += (Math.random() - 0.5) * force * 1.5;
            p.vy += (Math.random() - 0.5) * force * 1.5;
          }
        }

        p.vx += dx * stiffness;
        p.vy += dy * stiffness;
        p.vz += dz * stiffness;

        // ── Organic Wandering ─────────────────────────────────────────
        let wanderFactor: number;

        if (progress < 0.10 || (progress >= 0.25 && progress < 0.35) || (progress >= 0.65 && progress < 0.75)) {
          if (distToTarget < 1) {
            wanderFactor = 0;
          } else if (distToTarget < 5) {
            wanderFactor = 0.02;
          } else {
            wanderFactor = Math.min(0.3, distToTarget / 100);
          }
        } else {
          wanderFactor = 1;
        }

        if (wanderFactor > 0) {
          p.wanderAngle += (Math.random() - 0.5) * 0.1;
          p.vx += Math.cos(p.wanderAngle) * p.wanderSpeed * wanderFactor;
          p.vy += Math.sin(p.wanderAngle) * p.wanderSpeed * wanderFactor;
        }

        // Add some noise during scattered phases
        if ((progress >= 0.35 && progress < 0.55) || progress >= 0.75) {
          const n = 0.4;
          p.vx += (Math.random() - 0.5) * n;
          p.vy += (Math.random() - 0.5) * n;
        }

        p.vx *= damping;
        p.vy *= damping;
        p.vz *= damping;

        // Snap to exact position when very close (only if not mouse-affected)
        if (
          !isMouseAffected &&
          ((progress < 0.10) ||
            (progress >= 0.25 && progress < 0.35) ||
            (progress >= 0.65 && progress < 0.75))
        ) {
          if (distToTarget < 0.5) {
            p.x = tx;
            p.y = ty;
            p.z = tz;
            p.vx = 0;
            p.vy = 0;
            p.vz = 0;
          } else {
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
        }

        // ── 3D Projection ─────────────────────────────────────────────
        const scale = fov / (fov + p.z);
        const sx = (p.x - centerX) * scale + centerX;
        const sy = (p.y - centerY) * scale + centerY;

        // ── Opacity ───────────────────────────────────────────────────
        let alpha = 1;
        if (progress < 0.05) {
          const t = Math.max(entranceProgressRef.current, progress / 0.05);
          alpha = 0.5 + t * 0.5;
        } else if (progress >= 0.05 && progress < 0.15) {
          alpha = 1 - ((progress - 0.05) / 0.10) * 0.7; // Fade down to 0.3 during distortion
        } else if (progress >= 0.15 && progress < 0.25) {
          const t = (progress - 0.15) / 0.10;
          alpha = 0.3 + t * 0.7; // Fade back up to 1.0 for ARE YOU
        } else if (progress >= 0.25 && progress < 0.35) {
          alpha = 1; // Hold ARE YOU
        } else if (progress >= 0.35 && progress < 0.45) {
          alpha = 1 - ((progress - 0.35) / 0.10) * 0.8; // Fade down to 0.2 during scatter
        } else if (progress >= 0.45 && progress < 0.55) {
          alpha = 0.2; // Hold scatter
        } else if (progress >= 0.55 && progress < 0.65) {
          const t = (progress - 0.55) / 0.10;
          alpha = 0.2 + t * 0.8; // Fade back up to 1.0 for READY?
        } else if (progress >= 0.65 && progress < 0.75) {
          alpha = 1; // Hold READY?
        } else if (progress >= 0.75 && progress < 0.85) {
          alpha = 1 - ((progress - 0.75) / 0.10) * 0.8; // Fade down to 0.2 during scatter
        } else {
          alpha = 0.2; // Hold scatter
        }

        // ── Draw ──────────────────────────────────────────────────────
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        const sz = Math.max(0.5, p.size * scale);

        const isTextPhaseCurrent = (progress < 0.10) || (progress >= 0.25 && progress < 0.35) || (progress >= 0.65 && progress < 0.75);

        if (isTextPhaseCurrent && distToTarget < 1 && !isMouseAffected) {
          const rx = Math.round(sx);
          const ry = Math.round(sy);
          const rsz = Math.max(1, Math.round(sz));
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(rx, ry, rsz, rsz);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(sx - sz / 2, sy - sz / 2, sz, sz);
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [progress, isInitialized]);

  return (
    <div
      className={cn(
        'fixed inset-0 w-full h-full pointer-events-none z-0',
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};