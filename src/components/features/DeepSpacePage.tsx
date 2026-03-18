import React, {
  useRef, useMemo, useCallback, useEffect, useState, Suspense,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SpaceZoom, type ZoomPhase } from './SpaceZoom';
import './DeepSpacePage.css';

interface StarDef {
  id: string;
  label: string;
  bx: number;
  by: number;
  z: number;
  scrollThreshold: number;
  driftFreqX: number;
  driftFreqY: number;
  driftAmpX: number;
  driftAmpY: number;
  videoSrc: string;
}

const VIDEOS = [
  '/assets/The_Beauty_of_NBA_trimmed-_Greatest_Moments_1080P.mp4',
  '/assets/Usain_Bolt_9.58_-_100m_World_Record_50_fps_1080p50.mp4',
  '/assets/ufc.mp4',
];

const STARS: StarDef[] = [
  { id: 'world-cups', label: 'World Cups', bx: 14, by: 22, z: 0.85, scrollThreshold: 0.00, driftFreqX: 0.18, driftFreqY: 0.11, driftAmpX: 1.8, driftAmpY: 1.2, videoSrc: VIDEOS[0] },
  { id: 'rivalries', label: 'Greatest Rivalries', bx: 72, by: 20, z: 1.00, scrollThreshold: 0.08, driftFreqX: 0.22, driftFreqY: 0.14, driftAmpX: 1.4, driftAmpY: 1.0, videoSrc: VIDEOS[1] },
  { id: 'comebacks', label: 'Epic Comebacks', bx: 68, by: 60, z: 0.70, scrollThreshold: 0.17, driftFreqX: 0.16, driftFreqY: 0.09, driftAmpX: 2.0, driftAmpY: 1.4, videoSrc: VIDEOS[2] },
  { id: 'underdogs', label: 'Underdog Stories', bx: 42, by: 16, z: 0.45, scrollThreshold: 0.26, driftFreqX: 0.13, driftFreqY: 0.20, driftAmpX: 2.4, driftAmpY: 1.6, videoSrc: VIDEOS[0] },
  { id: 'finals', label: 'Legendary Finals', bx: 52, by: 40, z: 0.90, scrollThreshold: 0.36, driftFreqX: 0.20, driftFreqY: 0.15, driftAmpX: 1.6, driftAmpY: 1.1, videoSrc: VIDEOS[1] },
  { id: 'dynasties', label: 'Sporting Dynasties', bx: 36, by: 65, z: 0.55, scrollThreshold: 0.46, driftFreqX: 0.12, driftFreqY: 0.22, driftAmpX: 2.6, driftAmpY: 1.8, videoSrc: VIDEOS[2] },
  { id: 'debuts', label: 'Iconic Debuts', bx: 12, by: 52, z: 0.20, scrollThreshold: 0.57, driftFreqX: 0.09, driftFreqY: 0.13, driftAmpX: 3.4, driftAmpY: 2.4, videoSrc: VIDEOS[0] },
  { id: 'records', label: 'Record Breakers', bx: 86, by: 42, z: 0.30, scrollThreshold: 0.68, driftFreqX: 0.10, driftFreqY: 0.17, driftAmpX: 3.0, driftAmpY: 2.0, videoSrc: VIDEOS[1] },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const orbSize = (z: number) => lerp(5, 18, z);
const orbBlur = (z: number) => lerp(1.4, 0, z);
const orbHalo = (z: number) => lerp(5, 16, z);
const orbAlpha = (z: number) => lerp(0.35, 1.0, z);
const mouseReach = (z: number) => lerp(6, 18, z);
const mouseStr = (z: number) => lerp(0.008, 0.028, z);
const scrollMul = (z: number) => lerp(10, 60, z);

const PARTICLE_COUNT = 200;

function GoldenParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mouseRef = useRef(new THREE.Vector3(100, 100, 0));
  const { viewport } = useThree();

  const particles = useMemo(() => {
    const d = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      d.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10 - 2,
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          0,
        ),
        scale: Math.random() * 0.6 + 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return d;
  }, []);

  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const onPointerMove = useCallback((e: THREE.Event) => {
    const ev = e as unknown as { point: THREE.Vector3 };
    if (ev.point) mouseRef.current.set(ev.point.x, ev.point.y, 0);
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const mouse = mouseRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      p.position.x += p.velocity.x;
      p.position.y += p.velocity.y;
      if (p.position.x > 10) p.position.x = -10;
      if (p.position.x < -10) p.position.x = 10;
      if (p.position.y > 7) p.position.y = -7;
      if (p.position.y < -7) p.position.y = 7;

      const dx = p.position.x - mouse.x;
      const dy = p.position.y - mouse.y;
      const dSq = dx * dx + dy * dy;
      if (dSq < 16 && dSq > 0.01) {
        const d = Math.sqrt(dSq);
        const f = (4 - d) / 4 * 0.06;
        p.position.x += (dx / d) * f;
        p.position.y += (dy / d) * f;
      }
      p.position.y += Math.sin(t * 0.8 + p.phase) * 0.01;

      const tw = (Math.sin(t * 2.5 + p.phase) + 1) / 2;
      tempObj.position.copy(p.position);
      tempObj.scale.setScalar(p.scale * (0.6 + tw * 0.4) * 0.04);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);

      const b = 0.4 + tw * 0.6;
      tempColor.setRGB(b, b * 0.88, b * 0.5);
      meshRef.current.setColorAt(i, tempColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <mesh position={[0, 0, -1]} onPointerMove={onPointerMove as any} visible={false}>
        <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
        <meshBasicMaterial />
      </mesh>
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}

interface HeroOrbProps {
  star: StarDef;
  orbRef: (el: HTMLDivElement | null) => void;
  coreRef: (el: HTMLDivElement | null) => void;
  connectorRef: (el: HTMLDivElement | null) => void;
  lineRef: (el: HTMLDivElement | null) => void;
  onExplore: (id: string) => void;
}

const HeroOrb: React.FC<HeroOrbProps> = ({
  star, orbRef, coreRef, connectorRef, lineRef, onExplore,
}) => {
  const handleClick = useCallback(() => onExplore(star.id), [onExplore, star.id]);

  const size = orbSize(star.z);
  const halo = orbHalo(star.z);
  const blur = orbBlur(star.z);

  const r = Math.round(lerp(180, 255, star.z));
  const g = Math.round(lerp(160, 210, star.z));
  const b = Math.round(lerp(100, 80, star.z));

  return (
    <div
      ref={orbRef}
      className="hero-orb"
      data-id={star.id}
      style={{ left: `${star.bx}%`, top: `${star.by}%` }}
    >
      <div
        ref={coreRef}
        className="hero-orb__core"
        onClick={handleClick}
        title={star.label}
        style={{
          width: size,
          height: size,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          opacity: 0,
        }}
      >
        <div
          className="hero-orb__glow"
          style={{
            inset: -halo,
            background: `radial-gradient(circle, rgba(255,240,180,0.55) 0%, rgba(${r},${g},${b},0.2) 45%, transparent 70%)`,
          }}
        />
        <div
          className="hero-orb__dot"
          style={{
            inset: 0,
            background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,230,150,0.6) 35%, rgba(${r},${g},${b},0.15) 65%, transparent 100%)`,
          }}
        />
      </div>

      <div ref={connectorRef} className="hero-orb__connector" style={{ opacity: 0 }}>
        <div ref={lineRef} className="hero-orb__line" style={{ height: 0 }} />
        <span className="hero-orb__label" onClick={handleClick}>
          Click to Explore
        </span>
      </div>
    </div>
  );
};

interface DeepSpacePageProps {
  scrollProgress: number;
}

export const DeepSpacePage: React.FC<DeepSpacePageProps> = ({ scrollProgress }) => {
  const [zoomPhase, setZoomPhase] = useState<'idle' | 'in' | 'hold' | 'out'>('idle');
  const [zoomProgress, setZoomProgress] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState<{
    px: number; py: number;
    vx: number; vy: number;
    starColor: string;
    videoSrc: string;
  } | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const zoomRaf = useRef<number>(0);

  const zoomPhaseRef = useRef<'idle' | 'in' | 'hold' | 'out'>('idle');
  useEffect(() => { zoomPhaseRef.current = zoomPhase; }, [zoomPhase]);

  const expEase = useCallback((t: number) => {
    const k = 6;
    return (Math.exp(k * t) - 1) / (Math.exp(k) - 1);
  }, []);
  const expEaseOut = useCallback((t: number) => {
    return 1 - expEase(1 - t);
  }, [expEase]);

  const FWD_DURATION = 1400;
  const REV_DURATION = 900;
  const MAX_SCALE = 25;

  const orbEls = useRef<(HTMLDivElement | null)[]>([]);
  const coreEls = useRef<(HTMLDivElement | null)[]>([]);
  const connectorEls = useRef<(HTMLDivElement | null)[]>([]);
  const lineEls = useRef<(HTMLDivElement | null)[]>([]);

  const handleExplore = useCallback((id: string) => {
    if (zoomPhase !== 'idle') return;
    const star = STARS.find((s) => s.id === id);
    if (!star) return;
    const idx = STARS.indexOf(star);

    const orbEl = orbEls.current[idx];
    const coreEl = coreEls.current[idx];
    const el = coreEl || orbEl;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = rect.left + rect.width / 2;
    const py = rect.top + rect.height / 2;
    const vx = (px / window.innerWidth) * 100;
    const vy = (py / window.innerHeight) * 100;

    const r = Math.round(lerp(180, 255, star.z));
    const g = Math.round(lerp(160, 210, star.z));
    const b = Math.round(lerp(100, 80, star.z));

    setZoomOrigin({ px, py, vx, vy, starColor: r + ',' + g + ',' + b, videoSrc: star.videoSrc });
    setZoomPhase('in');
    setZoomProgress(0);
  }, [zoomPhase]);

  const handleZoomClose = useCallback(() => {
    const phase = zoomPhaseRef.current;
    if (phase === 'hold' || phase === 'in') {
      setZoomPhase('out');
    }
  }, []);

  useEffect(() => {
    if (zoomPhase !== 'in' || !zoomOrigin) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / FWD_DURATION);
      const eased = expEase(t);
      setZoomProgress(eased);

      if (sceneRef.current) {
        const s = 1 + eased * (MAX_SCALE - 1);
        sceneRef.current.style.transformOrigin = zoomOrigin.px + 'px ' + zoomOrigin.py + 'px';
        sceneRef.current.style.transform = 'scale(' + s.toFixed(4) + ')';
      }

      if (t < 1) {
        zoomRaf.current = requestAnimationFrame(tick);
      } else {
        setZoomProgress(1);
        setZoomPhase('hold');
      }
    };

    zoomRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(zoomRaf.current);
  }, [zoomPhase, zoomOrigin, expEase]);

  useEffect(() => {
    if (zoomPhase !== 'out' || !zoomOrigin) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / REV_DURATION);
      const eased = expEaseOut(t);
      const progress = 1 - eased;
      setZoomProgress(progress);

      if (sceneRef.current) {
        const s = 1 + progress * (MAX_SCALE - 1);
        sceneRef.current.style.transformOrigin = zoomOrigin.px + 'px ' + zoomOrigin.py + 'px';
        sceneRef.current.style.transform = 'scale(' + s.toFixed(4) + ')';
      }

      if (t < 1) {
        zoomRaf.current = requestAnimationFrame(tick);
      } else {
        if (sceneRef.current) {
          sceneRef.current.style.transform = '';
          sceneRef.current.style.transformOrigin = '';
        }
        setZoomProgress(0);
        setZoomPhase('idle');
        setZoomOrigin(null);
      }
    };

    zoomRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(zoomRaf.current);
  }, [zoomPhase, zoomOrigin, expEaseOut]);

  const setOrbRef = useCallback((i: number) => (el: HTMLDivElement | null) => { orbEls.current[i] = el; }, []);
  const setCoreRef = useCallback((i: number) => (el: HTMLDivElement | null) => { coreEls.current[i] = el; }, []);
  const setConnectorRef = useCallback((i: number) => (el: HTMLDivElement | null) => { connectorEls.current[i] = el; }, []);
  const setLineRef = useCallback((i: number) => (el: HTMLDivElement | null) => { lineEls.current[i] = el; }, []);

  const mouseVP = useRef({ x: 50, y: 50 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseVP.current.x = (e.clientX / window.innerWidth) * 100;
      mouseVP.current.y = (e.clientY / window.innerHeight) * 100;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const orbState = useRef(
    STARS.map(() => ({ driftX: 0, driftY: 0, mouseX: 0, mouseY: 0 })),
  );

  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const scrollRef = useRef(scrollProgress);
  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    const animate = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      const mx = mouseVP.current.x;
      const my = mouseVP.current.y;
      const sp = scrollRef.current;

      STARS.forEach((star, i) => {
        const el = orbEls.current[i];
        const coreEl = coreEls.current[i];
        const connEl = connectorEls.current[i];
        const lineEl = lineEls.current[i];
        if (!el) return;
        const st = orbState.current[i];

        const fadeIn = Math.min(1, Math.max(0, (sp - star.scrollThreshold) / 0.10));
        const lineIn = Math.min(1, Math.max(0, (sp - (star.scrollThreshold + 0.12)) / 0.10));
        const maxAlpha = orbAlpha(star.z);

        const isZooming = zoomPhaseRef.current !== 'idle';

        if (coreEl) coreEl.style.opacity = String(fadeIn * maxAlpha);
        if (connEl) connEl.style.opacity = isZooming ? '0' : String(lineIn);
        if (lineEl) lineEl.style.height = isZooming ? '0px' : `${lineIn * 52}px`;

        const speedMul = lerp(0.35, 1.0, star.z);
        const targetDX = Math.sin(t * star.driftFreqX * speedMul) * star.driftAmpX;
        const targetDY = Math.cos(t * star.driftFreqY * speedMul) * star.driftAmpY;
        st.driftX += (targetDX - st.driftX) * 0.025;
        st.driftY += (targetDY - st.driftY) * 0.025;

        const dx = star.bx + st.driftX - mx;
        const dy = star.by + st.driftY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const reach = mouseReach(star.z);
        const str = mouseStr(star.z);
        let targetMX = 0;
        let targetMY = 0;
        if (dist < reach && dist > 0.01) {
          const push = (reach - dist) / reach;
          targetMX = (dx / dist) * push * reach * str * 100;
          targetMY = (dy / dist) * push * reach * str * 100;
        }
        const inertia = lerp(0.012, 0.045, star.z);
        st.mouseX += (targetMX - st.mouseX) * inertia;
        st.mouseY += (targetMY - st.mouseY) * inertia;

        const parallaxY = sp * scrollMul(star.z);

        const totalX = st.driftX + st.mouseX;
        const totalY = st.driftY + st.mouseY - parallaxY;
        el.style.transform = `translate(${totalX.toFixed(2)}%, ${totalY.toFixed(2)}%)`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="deep-space">
      <div className="deep-space-scene" ref={sceneRef}>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 45, near: 0.1, far: 500 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
          dpr={[1, 2]}
          style={{ position: 'absolute', inset: 0, background: '#000' }}
        >
          <Suspense fallback={null}>
            <GoldenParticles />
            <EffectComposer>
              <Bloom intensity={1.8} luminanceThreshold={0.2} luminanceSmoothing={0.9} mipmapBlur />
            </EffectComposer>
          </Suspense>
        </Canvas>

        <div className="deep-space-orbs">
          {STARS.map((star, i) => (
            <HeroOrb
              key={star.id}
              star={star}
              orbRef={setOrbRef(i)}
              coreRef={setCoreRef(i)}
              connectorRef={setConnectorRef(i)}
              lineRef={setLineRef(i)}
              onExplore={handleExplore}
            />
          ))}
        </div>
      </div>

      {zoomPhase !== 'idle' && zoomOrigin && (
        <SpaceZoom
          originX={zoomOrigin.vx}
          originY={zoomOrigin.vy}
          starColor={zoomOrigin.starColor}
          videoSrc={zoomOrigin.videoSrc}
          zoomProgress={zoomProgress}
          phase={zoomPhase as 'in' | 'hold' | 'out'}
          onRequestClose={handleZoomClose}
        />
      )}
    </div>
  );
};

export default DeepSpacePage;