import React, { useRef, useMemo, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { TrophyScene, trophyFitData } from './Trophy';
import { WorldCupOrbit } from './WorldCupOrbit';

/* ─── Bridge: reads camera azimuthal angle and writes to shared ref ─── */
function CameraAngleBridge({ angleRef }: { angleRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const spherical = useMemo(() => new THREE.Spherical(), []);

  useFrame(() => {
    spherical.setFromVector3(camera.position);
    // theta is the azimuthal angle (horizontal rotation)
    angleRef.current = spherical.theta;
  });

  return null;
}

/* ─── Interactive particles that react to mouse ─── */
const PARTICLE_COUNT = 600;

function InteractiveParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mouseRef = useRef(new THREE.Vector3(100, 100, 0));
  const { viewport } = useThree();

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10 - 2
        ),
        basePosition: new THREE.Vector3(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          0
        ),
        scale: Math.random() * 0.6 + 0.2,
        brightness: Math.random(),
        phase: Math.random() * Math.PI * 2,
      });
    }
    data.forEach(p => p.basePosition.copy(p.position));
    return data;
  }, []);

  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const handlePointerMove = useCallback((e: THREE.Event) => {
    const event = e as unknown as { point: THREE.Vector3 };
    if (event.point) {
      mouseRef.current.set(event.point.x, event.point.y, 0);
    }
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
      const distSq = dx * dx + dy * dy;
      const interactionRadius = 4;
      if (distSq < interactionRadius * interactionRadius && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const force = (interactionRadius - dist) / interactionRadius * 0.06;
        p.position.x += (dx / dist) * force;
        p.position.y += (dy / dist) * force;
      }

      const floatY = Math.sin(t * 0.8 + p.phase) * 0.01;
      p.position.y += floatY;

      const twinkle = (Math.sin(t * 2.5 + p.phase) + 1) / 2;
      const s = p.scale * (0.6 + twinkle * 0.4);

      tempObj.position.copy(p.position);
      tempObj.scale.setScalar(s * 0.04);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);

      const brightness = 0.4 + twinkle * 0.6;
      tempColor.setRGB(
        brightness * 1.0,
        brightness * 0.88,
        brightness * 0.5
      );
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <mesh
        position={[0, 0, -1]}
        onPointerMove={handlePointerMove as any}
        visible={false}
      >
        <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
        <meshBasicMaterial />
      </mesh>

      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/* ─── Scroll-linked orbit target ─── */
function ScrollTarget({ scrollProgress, controlsRef }: { scrollProgress: number; controlsRef: React.RefObject<any> }) {
  const targetY = useRef(0);

  useFrame(() => {
    targetY.current = THREE.MathUtils.lerp(targetY.current, -scrollProgress * 3, 0.08);
    if (controlsRef.current) {
      controlsRef.current.target.y = targetY.current;
    }
  });

  return null;
}

/* ─── Main TrophyPage component ─── */
interface TrophyPageProps {
  scrollProgress: number;
}

export const TrophyPage: React.FC<TrophyPageProps> = ({ scrollProgress }) => {
  const controlsRef = useRef<any>(null);
  const cameraAngleRef = useRef(0);
  const [opacity, setOpacity] = React.useState(0);

  // Fade in slowly when mounted
  React.useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 50); // tiny delay to let paint happen
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, #000 0%, #000 70%, #020010 90%, #020010 100%)',
        opacity,
        transition: 'opacity 2s ease',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        dpr={[1, 2]}
        style={{ background: '#000' }}
      >
        <Suspense fallback={null}>
          <ScrollTarget scrollProgress={scrollProgress} controlsRef={controlsRef} />
          <CameraAngleBridge angleRef={cameraAngleRef} />
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            enableZoom
            enablePan={false}
            makeDefault
          />
          <TrophyScene scrollProgress={scrollProgress} />
          <InteractiveParticles />

          {/* Rich golden bloom */}
          <EffectComposer>
            <Bloom
              intensity={1.8}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* World Cup host nation flags orbiting the trophy */}
      <WorldCupOrbit cameraAngleRef={cameraAngleRef} />

      {/* Credit line */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 11,
          color: '#666',
          fontFamily: 'sans-serif',
          pointerEvents: 'none',
        }}
      >
        &quot;World Cup Trophy&quot; by waimus is licensed under CC BY-SA 4.0
      </div>
    </div>
  );
};

export default TrophyPage;
