import { UnifiedExperience, ColorRevealImage, TrophyPage, IntroGate, DeepSpacePage } from './components';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Trophy, Play, ChevronDown } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import Lenis from 'lenis';

const DEFAULT_IMAGES = [
  "https://i.guim.co.uk/img/media/7fa6a03e6a72421c0b2f40352ce1a423e6297974/0_0_3565_3019/master/3565.jpg?width=700&quality=85&auto=format&fit=max&s=6a106052ba4f57ab26d34c1f3b76c25d",
  "https://assets.gqindia.com/photos/60d568e178863c66ba52c434/16:9/w_2560%2Cc_limit/Wimbledon%2520Roger%2520Federer.jpg",
  "https://images.squarespace-cdn.com/content/v1/5f343ff9541cd11433040eca/e7627ee5-6f78-46c4-acc2-824eaea662da/Top+10+Moments+of+2023+F1+Season%2C+Formula+1+best+moments%2C+Max+Verstappen%2C+Red+Bull+Racing%2C+Alex+Albon%2C+Williams%2C+Fernando+Alonso%2C+Aston+Martin%2C+Checo+Perez%2C+Red+Bull+Racing%2C+Monaco+Grand+Prix%2C+Liam+Lawson%2C+McLaren+Formula+1%2C+Above+%2B+Beyond",
  "https://ichef.bbci.co.uk/images/ic/1024xn/p04l7q8j.jpg",
  "https://a.espncdn.com/photo/2017/0523/r212047_1296x864_3-2.jpg"
];

const BackgroundLayer = ({ src, index, activeIndex }: { key?: React.Key, src: string, index: number, activeIndex: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: index === 0 ? "0%" : "100%" }}
      animate={{
        y: index <= activeIndex ? "0%" : "100%",
        opacity: index <= activeIndex ? 1 : 0
      }}
      transition={{
        duration: index === 0 ? 2 : 1.4,
        ease: [0.22, 1, 0.36, 1]
      }}
      style={{
        zIndex: index,
      }}
      className="absolute inset-0 w-full h-full"
    >
      <ColorRevealImage
        src={src}
        alt={`Background ${index + 1}`}
        className="w-full h-full"
        imgClassName="w-full h-full object-cover"
      />
    </motion.div>
  );
};

function getPhase(p: number): number {
  if (p >= 0.88) return 6;  // Deep Space
  if (p >= 0.72) return 5;  // Trophy
  if (p >= 0.50) return 4;  // Image 5
  if (p >= 0.38) return 3;  // Image 4
  if (p >= 0.24) return 2;  // Image 3
  if (p >= 0.10) return 1;  // Image 2
  return 0;                  // Image 1 / Hero
}

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [bgImages, setBgImages] = useState(DEFAULT_IMAGES);
  const [showIntro, setShowIntro] = useState(true);
  const [particlesStarted, setParticlesStarted] = useState(false);
  const [bgReady, setBgReady] = useState(false);
  const boomRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicStartedRef = useRef(false);
  const [heroFormed, setHeroFormed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const audio = new Audio('/assets/Boom 1.mp3');
    audio.preload = 'auto';
    audio.volume = 1.0;
    boomRef.current = audio;
  }, []);

  useEffect(() => {
    const music = new Audio('/assets/nuthin-but-a-g-thang-dr-dre-snoop-dogg_sNZM7bxL.mp3');
    music.preload = 'auto';
    music.loop = true;
    music.volume = 0.01;
    bgMusicRef.current = music;
    return () => {
      music.pause();
      music.src = '';
    };
  }, []);

  const handleBoom = React.useCallback(() => {
    if (boomRef.current) {
      boomRef.current.currentTime = 0;
      boomRef.current.play().catch(() => { });
    }
  }, []);

  const handleHeroFormed = React.useCallback(() => {
    setHeroFormed(true);
  }, []);

  useEffect(() => {
    if (!heroFormed || bgMusicStartedRef.current) return;

    const startMusic = () => {
      if (bgMusicStartedRef.current) return;
      bgMusicStartedRef.current = true;
      if (bgMusicRef.current) {
        bgMusicRef.current.currentTime = 0;
        bgMusicRef.current.play().catch(() => { });
      }
      window.removeEventListener('wheel', startMusic);
      window.removeEventListener('touchstart', startMusic);
      window.removeEventListener('keydown', startMusic);
    };

    window.addEventListener('wheel', startMusic, { passive: true });
    window.addEventListener('touchstart', startMusic, { passive: true });
    window.addEventListener('keydown', startMusic);

    return () => {
      window.removeEventListener('wheel', startMusic);
      window.removeEventListener('touchstart', startMusic);
      window.removeEventListener('keydown', startMusic);
    };
  }, [heroFormed]);

  useEffect(() => {
    if (!particlesStarted) return;
    const t = setTimeout(() => setBgReady(true), 800);
    return () => clearTimeout(t);
  }, [particlesStarted]);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
    const newPhase = getPhase(latest);
    setPhase(prev => prev !== newPhase ? newPhase : prev);
    
    const music = bgMusicRef.current;
    if (music && bgMusicStartedRef.current) {
      const MIN_VOL = 0.012;
      const MAX_VOL = 0.05;
      if (latest >= 0.70) {
        const fadeT = Math.min(1, (latest - 0.70) / 0.10);
        music.volume = MAX_VOL - (MAX_VOL - MIN_VOL) * fadeT;
      } else {
        music.volume = MAX_VOL;
      }
    }
  });

  const activeIndex = Math.min(phase, 4);
  const progress = scrollProgress;

  // Particles fade - READY text shows at 0.54-0.64, fade after that
  const bgFadeStart = 0.64;
  const bgFadeEnd = 0.72;
  let coverLayerOpacity = 1;
  if (progress >= bgFadeEnd) {
    coverLayerOpacity = 0;
  } else if (progress >= bgFadeStart) {
    coverLayerOpacity = 1 - (progress - bgFadeStart) / (bgFadeEnd - bgFadeStart);
  }

  // Trophy section - extended to last longer (0.72 to 0.92 = 20% of scroll)
  const trophyPhaseStart = 0.72;
  const trophyFadeInEnd = 0.76;
  const trophyFadeOutStart = 0.88;
  const trophyPhaseEnd = 0.92;

  const showTrophy = progress >= trophyPhaseStart && progress < trophyPhaseEnd;

  let trophyOpacity = 0;
  if (showTrophy) {
    if (progress < trophyFadeInEnd) {
      trophyOpacity = Math.max(0, Math.min(1, (progress - trophyPhaseStart) / (trophyFadeInEnd - trophyPhaseStart)));
    } else if (progress > trophyFadeOutStart) {
      trophyOpacity = Math.max(0, Math.min(1, 1 - (progress - trophyFadeOutStart) / (trophyPhaseEnd - trophyFadeOutStart)));
    } else {
      trophyOpacity = 1;
    }
  }

  // Deep space - starts at 0.90
  const deepSpacePhaseStart = 0.90;
  const deepSpaceFadeInEnd = 0.94;

  const showDeepSpace = progress >= deepSpacePhaseStart;

  let deepSpaceOpacity = 0;
  if (showDeepSpace) {
    if (progress < deepSpaceFadeInEnd) {
      deepSpaceOpacity = Math.max(0, Math.min(1, (progress - deepSpacePhaseStart) / (deepSpaceFadeInEnd - deepSpacePhaseStart)));
    } else {
      deepSpaceOpacity = 1;
    }
  }

  const relativeTrophyProgress = showTrophy
    ? Math.max(0, Math.min(1, (progress - trophyPhaseStart) / (trophyPhaseEnd - trophyPhaseStart)))
    : 0;

  const deepSpaceProgressValue = showDeepSpace
    ? Math.max(0, Math.min(1, (progress - deepSpacePhaseStart) / (1.0 - deepSpacePhaseStart)))
    : 0;

  return (
    <main ref={containerRef} className="text-white min-h-[800vh] selection:bg-white selection:text-black relative">

      {showIntro && (
        <IntroGate
          onBlast={() => setParticlesStarted(true)}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Scroll spacer */}
      <section className="relative z-20 h-[400vh] pointer-events-none" />

      {/* Background images layer */}
      <div 
        className="fixed inset-0 z-0 overflow-hidden bg-black" 
        style={{ 
          opacity: bgReady ? coverLayerOpacity : 0, 
          transition: coverLayerOpacity < 1 ? 'none' : 'opacity 2.5s ease' 
        }}
      >
        {bgImages.map((src, i) => (
          <BackgroundLayer key={i} src={src} index={i} activeIndex={activeIndex} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-10 pointer-events-none" />
      </div>

      {/* Particles */}
      <div 
        className="fixed inset-0 z-[10000] pointer-events-none" 
        style={{ willChange: 'auto', opacity: coverLayerOpacity }}
      >
        <UnifiedExperience 
          progress={progress} 
          startEntrance={particlesStarted} 
          onHeroFormed={handleHeroFormed} 
          onBoom={handleBoom} 
        />
      </div>

      {/* Hero UI */}
      <section className="relative z-20 h-screen flex flex-col items-center justify-center overflow-hidden pointer-events-none">
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
          className="flex flex-col items-center"
        >
          <div className="absolute top-8 left-8 z-10 flex items-center gap-4 pointer-events-auto">
            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-5 h-5 text-white/80" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">ARCHIVE</span>
              <span className="text-xs font-medium tracking-wider">VOL. 01 — HISTORIC MOMENTS</span>
            </div>
          </div>

          <div className="absolute top-8 right-8 z-10 pointer-events-auto">
            <button className="px-6 py-2 rounded-full border border-white/20 text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-sm">
              ENTER GALLERY
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-12 flex flex-col items-center gap-4 z-10"
          >
            <div className="flex items-center gap-8 text-[10px] uppercase tracking-[0.4em] text-white/50">
              <span>SCROLL TO EXPLORE</span>
            </div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronDown className="w-4 h-4 text-white/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Additional scroll space */}
      <section className="relative z-20 h-[200vh] pointer-events-none" />

      {/* Trophy Layer */}
      <div
        className="fixed inset-0 w-full h-full z-[10001]"
        style={{
          opacity: trophyOpacity,
          pointerEvents: trophyOpacity > 0.1 ? 'auto' : 'none',
          visibility: trophyOpacity > 0 ? 'visible' : 'hidden'
        }}
      >
        <TrophyPage scrollProgress={relativeTrophyProgress} />
      </div>

      {/* Deep Space Layer */}
      <div
        className="fixed inset-0 w-full h-full z-[10002]"
        style={{
          opacity: deepSpaceOpacity,
          pointerEvents: deepSpaceOpacity > 0.1 ? 'auto' : 'none',
          visibility: deepSpaceOpacity > 0 ? 'visible' : 'hidden'
        }}
      >
        <DeepSpacePage scrollProgress={deepSpaceProgressValue} />
      </div>

    </main>
  );
}

export default App;