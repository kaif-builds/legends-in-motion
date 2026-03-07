import { UnifiedExperience, ColorRevealImage, TrophyPage } from './components';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Trophy, Play, ChevronDown, ImagePlus } from 'lucide-react';
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

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [bgImages, setBgImages] = useState(DEFAULT_IMAGES);


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
    setProgress(latest);
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const currentIndex = Math.min(4, Math.floor(progress * 5));
      const newImages = [...bgImages];
      newImages[currentIndex] = url;
      setBgImages(newImages);
    }
  };

  let activeIndex = 0;
  // Remap progress: trophy takes 0–0.25, gallery takes 0.25–1.0
  const galleryProgress = Math.max(0, (progress - 0.25) / 0.75);
  if (galleryProgress >= 0.80) activeIndex = 4;
  else if (galleryProgress >= 0.60) activeIndex = 3;
  else if (galleryProgress >= 0.40) activeIndex = 2;
  else if (galleryProgress >= 0.20) activeIndex = 1;

  return (
    <main ref={containerRef} className="text-white min-h-[900vh] selection:bg-white selection:text-black relative">
      {/* ═══ TROPHY SECTION (first page) ═══ */}
      {progress < 0.25 && (
        <TrophyPage scrollProgress={Math.min(progress / 0.2, 1)} />
      )}

      {/* Trophy scroll spacer — 3 viewports of scroll height */}
      <section className="relative z-20 h-[300vh] pointer-events-none" />

      {/* ═══ ORIGINAL CONTENT BELOW (unchanged) ═══ */}

      {/* Background Images */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-black" style={{ opacity: progress < 0.2 ? 0 : 1, transition: 'opacity 0.5s' }}>
        {bgImages.map((src, i) => (
          <BackgroundLayer key={i} src={src} index={i} activeIndex={activeIndex} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-10 pointer-events-none" />
      </div>

      {/* Image Upload Button */}
      <div className="fixed top-8 right-8 z-50">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm bg-black/20 hover:bg-white/10 transition-colors group"
          title="Upload Custom Background"
        >
          <ImagePlus className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Fixed Background Experience */}
      <div className="relative z-10 pointer-events-none">
        <UnifiedExperience progress={progress} />
      </div>

      {/* Hero Section Overlay (0 to 0.20) */}
      <section className="relative z-20 h-screen flex flex-col items-center justify-center overflow-hidden pointer-events-none">
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
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

      {/* Spacer for Transition */}
      <section className="relative z-20 h-[200vh] pointer-events-none" />

      {/* Helix Section Overlay (0.40 to 0.80) */}
      <section className="relative z-20 h-screen flex items-center justify-center pointer-events-none">
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0.5, 0.6, 0.75, 0.85], [0, 1, 1, 0]) }}
          className="text-center"
        >
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 items-center">
            <div className="w-12 h-[1px] bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/20">PHASE 02</span>
            <div className="w-12 h-[1px] bg-white/10" />
          </div>
        </motion.div>
      </section>


    </main>
  );
}

export default App;
