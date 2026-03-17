# Legends in Motion

**Legends in Motion** is a high-performance, immersive web experience celebrating iconic moments in sports history. It combines WebGL, React Three Fiber, and custom shader work to create a seamless scroll-driven narrative that transitions from a particle-based hero section to a 3D trophy gallery and finally into a deep-space exploration of legendary events.

## Features

*   **Cinematic Scroll Experience**: A continuous, single-page journey where scroll progress drives 3D animations, camera movements, and scene transitions.
*   **Particle Effects**: Custom GPU-accelerated particle systems that morph from chaotic clouds into legible text and shapes.
*   **3D Trophy Gallery**: An interactive 3D trophy room featuring orbiting flags of World Cup host nations.
    *   **Interactive Flags**: Click on orbiting flags to watch highlight reels from historical tournaments.
*   **Deep Space Exploration**: A final immersive section where users fly through a starfield of "Hero Orbs."
    *   **Zoom Transitions**: Seamless camera flights into individual stars to reveal dedicated video content (NBA, UFC, Olympics, etc.).
    *   **Responsive Design**: Touch-optimized interactions for mobile devices.
*   **Dynamic Audio**: Background music and sound effects that react to user interaction and scroll phases.

## Tech Stack

*   **Framework**: [React](https://reactjs.org/) (TypeScript)
*   **3D Engine**: [Three.js](https://threejs.org/) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
*   **Animation**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://greensock.com/gsap/) (for complex timelines)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Performance**: [Lenis](https://github.com/studio-freight/lenis) for smooth scrolling normalization.

## Project Structure

*   **`src/App.tsx`**: The main orchestrator. Handles scroll-based phase logic, mounting of major sections (Hero, Trophy, Deep Space), and global audio/background state.
*   **`src/components/features/`**:
    *   **`UnifiedExperience.tsx`**: Manages the initial particle morphing and text formation effects.
    *   **`TrophyPage.tsx`**: Renders the 3D trophy scene with lighting and materials.
    *   **`WorldCupOrbit.tsx`**: Handles the orbiting flags logic, including the YouTube video overlay system.
    *   **`DeepSpacePage.tsx`**: The final starfield section. Implementation of the "fly-through" camera effect and individual star interactions.
    *   **`SpaceZoom.tsx`**: The cinematic transition layer for entering a star's video content.

## Key Interactions

1.  **Scroll to Explore**: The primary navigation mechanic.
2.  **Trophy Room**:
    *   Scroll to rotate the trophy.
    *   Click flags to open video highlights.
3.  **Deep Space**:
    *   Scroll past the trophy to enter deep space.
    *   Click/Tap on glowing "Hero Orbs" to fly into them and watch legendary sports clips.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Customization

*   **Backgrounds**: Users can upload their own custom background image via the floating button in the top-right corner.
*   **Videos**: Video content for the trophy flags and space stars is mapped in `WorldCupOrbit.tsx` and `DeepSpacePage.tsx` respectively.

## Performance Note

This project makes heavy use of WebGL. A dedicated GPU is recommended for the smoothest experience, though optimizations (instanced meshes, texture compression) are in place for
