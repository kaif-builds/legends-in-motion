import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════
   GLB TROPHY MODEL
   Loads trophy.glb, applies gold material, auto-fits to viewport.
   ═══════════════════════════════════════════════════════════════ */

// Material overrides applied to the GLB's own materials
const MAT_OVERRIDES = {
  metalness: 1.0,
  roughness: 0.2,
  envMapIntensity: 2.0,
};

interface TrophyModelProps {
  scrollProgress: number;
}

// Shared ref so CameraController can read the computed distance
export const trophyFitData = { cameraZ: 5 };

export function TrophyModel({ scrollProgress }: TrophyModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/trophy.glb');
  const { camera } = useThree();

  const smoothRotation = useRef(0);
  const smoothY = useRef(0);

  const fitResult = useMemo(() => {
    // Compute bounding box on the raw scene
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Scale so the largest dimension = 3 world units
    const desiredSize = 3;
    const scale = desiredSize / maxDim;

    // Center offset in MODEL space (before scaling)
    const offset = center.negate();

    // Camera distance to fit with padding
    const fov = 45;
    const fovRad = (fov * Math.PI) / 180;
    const dist = (desiredSize / 2) / Math.tan(fovRad / 2) * 1.5;

    return { scale, offset, dist };
  }, [scene]);

  // Boost existing materials for realistic look (keep GLB's own textures/colors)
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material;
        if (mat && (mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
          const m = mat as THREE.MeshStandardMaterial;
          m.metalness = MAT_OVERRIDES.metalness;
          m.roughness = MAT_OVERRIDES.roughness;
          m.envMapIntensity = MAT_OVERRIDES.envMapIntensity;
          m.needsUpdate = true;
        }
      }
    });

    trophyFitData.cameraZ = fitResult.dist;
    camera.position.set(0, 0, fitResult.dist);
    camera.lookAt(0, 0, 0);
  }, [scene, camera, fitResult]);

  useFrame(() => {
    if (!groupRef.current) return;

    const targetRotation = scrollProgress * Math.PI * 4;
    const targetY = -scrollProgress * 3;

    smoothRotation.current = THREE.MathUtils.lerp(smoothRotation.current, targetRotation, 0.08);
    smoothY.current = THREE.MathUtils.lerp(smoothY.current, targetY, 0.08);

    groupRef.current.rotation.y = smoothRotation.current;
    groupRef.current.position.y = smoothY.current;
  });

  const s = fitResult.scale;

  return (
    <group ref={groupRef}>
      <group scale={[s, s, s]} position={[
        fitResult.offset.x * s,
        fitResult.offset.y * s,
        fitResult.offset.z * s
      ]}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

/* ───── Scene lighting & environment ───── */
/* ─── RectAreaLight helper (must be inside Canvas) ─── */
function FrontRectLight() {
  const lightRef = useRef<THREE.RectAreaLight>(null);
  useEffect(() => {
    // RectAreaLightUniformsLib is auto-included by drei/three
  }, []);
  return (
    <rectAreaLight
      ref={lightRef}
      position={[0, 0, 4]}
      width={6}
      height={6}
      intensity={3}
      color="#ffffff"
    />
  );
}

export function TrophyScene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      {/* Soft ambient fill */}
      <ambientLight intensity={0.4} color="#fff8ee" />

      {/* Warm spotlight from above */}
      <spotLight
        position={[0, 12, 4]}
        angle={0.4}
        penumbra={0.8}
        intensity={3}
        color="#fff5d4"
        castShadow
      />

      {/* Front rect area light for broad reflections */}
      <FrontRectLight />

      <TrophyModel scrollProgress={scrollProgress} />

      {/* HDRI environment for realistic gold reflections */}
      <Environment
        preset="sunset"
        environmentIntensity={1.5}
      />
    </>
  );
}

useGLTF.preload('/assets/trophy.glb');

export default TrophyScene;
