import React, { useEffect, useRef, useState } from 'react';

interface IntroGateProps {
  onBlast: () => void;   // called when the particle blast starts → show trophy
  onComplete: () => void; // called when fully faded out → unmount intro
}

export const IntroGate: React.FC<IntroGateProps> = ({ onBlast, onComplete }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data === 'intro:blast') {
        // Particle blast just started — tell App to show trophy immediately
        onBlast();
        // Start fading the intro overlay out in sync with the blast
        setExiting(true);
      }
      if (e.data === 'intro:done') {
        // Fully done — unmount
        setExiting(true);
        setTimeout(onComplete, 800);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onBlast, onComplete]);

  const handleSkip = () => {
    onBlast();
    setExiting(true);
    setTimeout(onComplete, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        opacity: exiting ? 0 : 1,
        transition: 'opacity 1.2s ease',
        background: '#000',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      <iframe
        ref={iframeRef}
        src="/intro.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        title="Intro"
      />

      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'rgba(255,255,255,0.5)',
          padding: '8px 20px',
          borderRadius: 999,
          fontSize: 11,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          zIndex: 10000,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
      >
        SKIP
      </button>
    </div>
  );
};
