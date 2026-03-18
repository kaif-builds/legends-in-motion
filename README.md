# 🏆 Legends in Motion

> **Best experienced on desktop.** Some features including the 3D trophy room, particle animations, and deep space exploration require WebGL and are optimized for desktop browsers. Mobile is supported but a desktop experience is strongly recommended.


**Legends in Motion** is a high-performance, cinematic web experience celebrating the greatest moments in sports history. Powered by WebGL, React Three Fiber, and custom GPU particle shaders, it delivers a seamless scroll-driven narrative — from a particle-based hero section, through a fully interactive 3D trophy gallery, and into an immersive deep-space exploration of legendary sporting events.

----

## ✨ Features

### 🎬 Cinematic Scroll Experience
A continuous, single-page journey where scroll progress drives every 3D animation, camera movement, and scene transition. No clicks required — just scroll to explore.

### ⚡ GPU Particle System
Custom GPU-accelerated particles morph from scattered clouds into legible text formations — "ARE YOU READY?" — before scattering outward and seamlessly handing off to the 3D trophy room. The transition is designed to feel like one continuous motion.

### 🏅 3D Trophy Gallery

An interactive 3D trophy room with photorealistic lighting and materials. Orbiting flags of World Cup host nations float around the trophy — click any flag to watch highlight reels from that tournament.

### 🌌 Deep Space Exploration
The final chapter. Fly through a starfield of glowing "Hero Orbs" representing legendary sporting categories — World Cups, Greatest Rivalries, Epic Comebacks, Underdog Stories, and more. Click any orb to trigger a cinematic zoom-in revealing exclusive video content.

### 🔊 Dynamic Audio
Background music and sound effects react to scroll phases and user interactions. Audio fades smoothly between sections for a fully immersive atmosphere.

### 🖼️ Custom Background Engine
Upload your own background images via the floating button in the top-right corner. Images are applied per-phase with smooth transitions.

### 📱 Responsive Design
Touch-optimized interactions with viewport-aware scaling for fonts, layouts, and 3D scenes across all screen sizes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (TypeScript) |
| 3D Engine | Three.js via React Three Fiber |
| Animation | Framer Motion + GSAP |
| Styling | Tailwind CSS |
| Scroll | Lenis (smooth scroll normalization) |
| Post-processing | @react-three/postprocessing (Bloom) |
| Assets | GLTF trophy model, MP4/YouTube video embeds |

This project makes heavy use of WebGL. A dedicated GPU is recommended for the smoothest experience, though optimizations (instanced meshes, texture compression) are in place for devices with integrated graphics.

## Recent Updates

*   **Mobile Responsiveness**: Implemented global touch configurations, locked overflow logic, and viewport-aware CSS to provide a cohesive experience across all devices.
*   **Responsive Scaling**: Unified interface overlays, 3D canvases, and particle systems automatically adjust attributes like font-size, layout boundaries, and positioning depending on screen dimensions.
*   **Custom Background Engine Fixed**: Transition timing elements and logic handlers across all views correctly track visibility on mobile resolutions.

---

## 📁 Project Structure

```
src/
├── App.tsx                        # Main orchestrator — scroll phases, section mounting, audio
└── components/
    └── features/
        ├── UnifiedExperience.tsx  # GPU particle morphing and text formation
        ├── TrophyPage.tsx         # 3D trophy scene — lighting, materials, camera
        ├── WorldCupOrbit.tsx      # Orbiting flags + YouTube video overlay system
        ├── DeepSpacePage.tsx      # Starfield, Hero Orbs, parallax drift, scroll reveal
        └── SpaceZoom.tsx          # Cinematic zoom transition into each star's video
```

---

## 🎮 Key Interactions

**1. Scroll to Explore**
The entire experience is scroll-driven. Every section, animation, and transition is tied to your scroll position.

**2. Trophy Room**
- Scroll slowly to rotate and tilt the trophy
- Click any orbiting flag to open a video highlight reel from that World Cup

**3. Deep Space**
- Continue scrolling past the trophy to enter deep space
- Stars reveal themselves progressively as you scroll
- Click or tap any glowing Hero Orb to fly into it and watch a legendary sports clip
- Press the close button to zoom back out and continue exploring

---

## 🚀 Getting Started

**1. Install Dependencies**
```bash
npm install
```

**2. Run Development Server**
```bash
npm run dev
```

**3. Build for Production**
```bash
npm run build
```

---

**Deep Space Videos**
Each Hero Orb maps to a video source defined in `DeepSpacePage.tsx`. Swap in YouTube embed URLs or local MP4 paths per star:
```typescript
{ id: 'world-cups', label: 'World Cups', videoSrc: 'https://www.youtube.com/embed/YOUR_ID' }
```

**Trophy Flag Videos**
Video sources for the orbiting World Cup flags are mapped in `WorldCupOrbit.tsx`.

---

## ⚙️ Performance Notes

This project makes heavy use of WebGL and runs multiple simultaneous render pipelines. For the smoothest experience:

- **Use a desktop browser** (Chrome or Firefox recommended)
- A **dedicated GPU** is strongly recommended
- On lower-end devices, the particle count and post-processing effects will automatically scale down
- Videos are streamed on demand — only loaded when a star or flag is clicked

### Optimizations in place
- Instanced meshes for the particle system
- Phase-based component mounting (Trophy and Deep Space are only mounted when visible)
- Lenis scroll normalization for consistent 60fps scroll events
- Opacity-based handoff between 2D particles and 3D scene to eliminate redundant renders

---

> **Performance notice:** This site runs multiple WebGL pipelines simultaneously — a dedicated GPU and a modern browser (Chrome or Firefox) are recommended for the full 60fps experience.
---

## 📄 License

Built with ❤️ for sports history. All video content belongs to their respective rights holders.
