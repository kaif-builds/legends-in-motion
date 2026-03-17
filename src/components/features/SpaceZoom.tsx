import React, { useRef, useEffect } from 'react';
import './SpaceZoom.css';

export type ZoomPhase = 'in' | 'hold' | 'out' | 'done';

export interface SpaceZoomProps {
  originX: number;
  originY: number;
  starColor?: string;
  zoomProgress: number;
  phase: ZoomPhase;
  videoSrc?: string;
  onRequestClose: () => void;
}

export const SpaceZoom: React.FC<SpaceZoomProps> = ({
  originX,
  originY,
  starColor = '255,210,80',
  zoomProgress,
  phase,
  videoSrc = '/assets/The_Beauty_of_NBA_trimmed-_Greatest_Moments_1080P.mp4',
  onRequestClose,
}) => {
  const bloomRef = useRef<HTMLDivElement>(null);
  const shakerRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const videoStarted = useRef(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.preload = 'auto';
      videoRef.current.load();
    }
  }, []);

  useEffect(() => {
    if (phase === 'out' && videoRef.current) {
      videoRef.current.pause();
    }
  }, [phase]);

  useEffect(() => {
    const t = zoomProgress;

    if (bloomRef.current) {
      const bT = Math.max(0, (t - 0.80) / 0.20);
      bloomRef.current.style.opacity = String(bT * 0.92);
      if (bT > 0) {
        bloomRef.current.style.background =
          'radial-gradient(circle at ' + originX + '% ' + originY + '%, ' +
          'rgba(255,255,255,' + bT.toFixed(2) + ') 0%, ' +
          'rgba(' + starColor + ',' + (bT * 0.4).toFixed(2) + ') 30%, ' +
          'rgba(0,0,0,0) 70%)';
      }
    }

    if (shakerRef.current) {
      if (phase === 'in' || phase === 'out') {
        const shakeAmt = t < 0.3 ? 0 : Math.pow((t - 0.3) / 0.7, 2) * 6;
        const sx = (Math.random() - 0.5) * shakeAmt;
        const sy = (Math.random() - 0.5) * shakeAmt;
        shakerRef.current.style.transform =
          'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)';
      } else {
        shakerRef.current.style.transform = '';
      }
    }

    if (videoWrapRef.current) {
      const vT = Math.max(0, (t - 0.75) / 0.125);
      const vOpacity = Math.min(1, vT);
      videoWrapRef.current.style.opacity = String(vOpacity);
      if (vOpacity > 0.1) {
        videoWrapRef.current.classList.add('space-zoom-video-wrap--active');
      } else {
        videoWrapRef.current.classList.remove('space-zoom-video-wrap--active');
      }
      if (vOpacity > 0.1 && videoRef.current && videoRef.current.paused && !videoStarted.current) {
        videoStarted.current = true;
        videoRef.current.play().catch(function () { });
      }
    }

    if (closeRef.current) {
      const btnT = Math.max(0, (t - 0.875) / 0.125);
      const btnOpacity = Math.min(1, btnT);
      closeRef.current.style.opacity = String(btnOpacity);
      closeRef.current.style.pointerEvents = btnOpacity > 0.5 ? 'auto' : 'none';
    }
  }, [zoomProgress, phase, originX, originY, starColor]);

  useEffect(() => {
    if (phase === 'done') {
      videoStarted.current = false;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [phase]);

  return (
    <div className="space-zoom-overlay">
      <div ref={bloomRef} className="space-zoom-bloom" />
      <div ref={shakerRef} className="space-zoom-shaker">
        <div ref={videoWrapRef} className="space-zoom-video-wrap">
          <video
            ref={videoRef}
            className="space-zoom-video"
            src={videoSrc}
            playsInline
          />
          <div className="space-zoom-vignette" />
        </div>
      </div>
      <button
        ref={closeRef}
        className="space-zoom-close"
        onClick={onRequestClose}
        aria-label="Close video"
      >
        &#x2715;
      </button>
    </div>
  );
};

export default SpaceZoom;
