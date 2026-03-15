import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import './WorldCupOrbit.css';

/* ─── World Cup data ─── */
interface HostFlag {
  country: string;
  code: string;
}

interface WorldCupData {
  year: number;
  caption: string;
  flags: HostFlag[];
  videoId: string;
}

const WORLD_CUPS: WorldCupData[] = [
  {
    year: 2002,
    caption: "Football's first World Cup in Asia",
    flags: [
      { country: 'Japan', code: 'jp' },
      { country: 'South Korea', code: 'kr' },
    ],
    videoId: 'k6xteH5ryHM',
  },
  {
    year: 2006,
    caption: "Germany's festival of football",
    flags: [{ country: 'Germany', code: 'de' }],
    videoId: 'WXECIq9V-o4',
  },
  {
    year: 2010,
    caption: "The World Cup of vuvuzelas",
    flags: [{ country: 'South Africa', code: 'za' }],
    videoId: 'QllPXed3_pc',
  },
  {
    year: 2014,
    caption: "Brazil's beautiful chaos",
    flags: [{ country: 'Brazil', code: 'br' }],
    videoId: 'iMMkLTneOaY',
  },
  {
    year: 2018,
    caption: "Russia's tournament of surprises",
    flags: [{ country: 'Russia', code: 'ru' }],
    videoId: 'eNxqyQ6TVwc',
  },
  {
    year: 2022,
    caption: "The desert World Cup",
    flags: [{ country: 'Qatar', code: 'qa' }],
    videoId: 'nnR1gl1ItaQ',
  },
];

const FLAG_CDN = 'https://flagcdn.com/w160';

/* ─── FlagFrame component ─── */
interface FlagFrameProps {
  data: WorldCupData;
}

const FlagFrame: React.FC<FlagFrameProps> = ({ data }) => {
  const [activeFlagIndex, setActiveFlagIndex] = useState(0);
  const isMultiHost = data.flags.length > 1;

  useEffect(() => {
    if (!isMultiHost) return;
    const interval = setInterval(() => {
      setActiveFlagIndex((prev) => (prev + 1) % data.flags.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [isMultiHost, data.flags.length]);

  return (
    <>
      <div className="wc-flag-inner">
        {/* Flag image(s) */}
        <div className="wc-flag-img-wrapper">
          {data.flags.map((flag, i) => (
            <img
              key={flag.code}
              className="wc-flag-img"
              src={`${FLAG_CDN}/${flag.code}.png`}
              alt={flag.country}
              draggable={false}
              style={{
                position: isMultiHost ? 'absolute' : 'relative',
                opacity: isMultiHost ? (i === activeFlagIndex ? 1 : 0) : 1,
              }}
            />
          ))}
        </div>
      </div>

      {/* Tooltip - outside wc-flag-inner to avoid overflow:hidden clipping */}
      <div className="wc-tooltip">
        <div className="wc-tooltip-year">{data.year}</div>
        <div className="wc-tooltip-caption">{data.caption}</div>
      </div>
    </>
  );
};

/* ─── Orbit radius helper ─── */
function getOrbitRadius(): number {
  const vmin = Math.min(window.innerWidth, window.innerHeight);
  // Responsive: larger screens get a bigger orbit
  if (vmin > 900) return 260;
  if (vmin > 600) return 200;
  return 155;
}

/* ─── VideoModal component ─── */
interface VideoModalProps {
  videoId: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoId, onClose }) => {
  return (
    <div className="wc-video-overlay" onClick={onClose}>
      <div className="wc-video-container" onClick={(e) => e.stopPropagation()}>
        <button className="wc-video-close" onClick={onClose}>
          &times;
        </button>
        <iframe
          className="wc-video-iframe"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

/* ─── WorldCupOrbit component ─── */
interface WorldCupOrbitProps {
  cameraAngleRef?: MutableRefObject<number>;
}

export const WorldCupOrbit: React.FC<WorldCupOrbitProps> = ({ cameraAngleRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const radiusRef = useRef(getOrbitRadius());

  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = activeVideoId !== null;
  }, [activeVideoId]);

  // Track window resize for responsive radius
  useEffect(() => {
    const handleResize = () => {
      radiusRef.current = getOrbitRadius();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    const COUNT = WORLD_CUPS.length;
    const SPEED = 0.15; // radians per second — slow & smooth
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      
      if (!isPausedRef.current) {
        angleRef.current += SPEED * dt;
      }

      // Apply camera azimuthal offset so orbit rotates with the trophy
      const cameraOffset = cameraAngleRef ? cameraAngleRef.current : 0;

      const radius = radiusRef.current;
      const angleStep = (Math.PI * 2) / COUNT;

      for (let i = 0; i < COUNT; i++) {
        const el = frameRefs.current[i];
        if (!el) continue;

        const theta = angleRef.current + i * angleStep + cameraOffset;
        // Subtle vertical float
        const floatY = Math.sin(now * 0.001 + i * 1.2) * 4;

        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius * 0.38 + floatY; // elliptical for perspective
        // Depth-based scale for pseudo-3D feel
        const depth = Math.sin(theta); // -1 (back) to 1 (front)
        const scale = 0.75 + 0.25 * ((depth + 1) / 2); // 0.75 → 1.0

        // Front/back visibility: flags behind the trophy fade out
        // depth ranges from -1 (back) to 1 (front)
        // Smooth transition zone around the sides (-0.15 to 0.15)
        let opacity: number;
        if (depth > 0.15) {
          // Front half — fully visible with depth-based variation
          opacity = 0.55 + 0.45 * ((depth + 1) / 2);
        } else if (depth > -0.15) {
          // Transition zone — smooth fade
          const t = (depth + 0.15) / 0.3; // 0 to 1
          opacity = t * (0.55 + 0.45 * ((depth + 1) / 2));
        } else {
          // Back half — hidden
          opacity = 0;
        }

        const zIndex = depth > 0 ? 100 : 1;
        const pointerEvents = opacity > 0.1 ? 'auto' : 'none';

        el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        el.style.zIndex = String(zIndex);
        el.style.opacity = String(opacity);
        el.style.pointerEvents = pointerEvents;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraAngleRef]);

  const setRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      frameRefs.current[index] = el;
    },
    [],
  );

  return (
    <>
      <div className="wc-orbit-container" ref={containerRef}>
        <div className="wc-orbit-ring">
          {WORLD_CUPS.map((wc, i) => (
            <div 
              key={wc.year} 
              className="wc-flag-frame" 
              ref={setRef(i)}
              onClick={() => setActiveVideoId(wc.videoId)}
              style={{ cursor: 'pointer' }}
            >
              <FlagFrame data={wc} />
            </div>
          ))}
        </div>
      </div>
      {activeVideoId && <VideoModal videoId={activeVideoId} onClose={() => setActiveVideoId(null)} />}
    </>
  );
};

export default WorldCupOrbit;
