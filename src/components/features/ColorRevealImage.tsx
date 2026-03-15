import React, { useRef, useCallback, useState } from 'react';

interface ColorRevealImageProps {
  src: string;
  alt?: string;
  radius?: number;
  className?: string;
  imgClassName?: string;
}

export const ColorRevealImage: React.FC<ColorRevealImageProps> = ({
  src,
  alt = '',
  radius = 100,
  className = '',
  imgClassName = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const grayscaleRef = useRef<HTMLImageElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !grayscaleRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update cursor dot position via ref (no re-render)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
      }

      const revealRadius = radius * 1.65;
      const mask = `radial-gradient(circle ${revealRadius}px at ${x}px ${y}px, transparent 0%, transparent 60%, black 100%)`;
      grayscaleRef.current.style.webkitMaskImage = mask;
      grayscaleRef.current.style.maskImage = mask;
    },
    [radius]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (grayscaleRef.current) {
      grayscaleRef.current.style.webkitMaskImage = 'none';
      grayscaleRef.current.style.maskImage = 'none';
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Bottom Layer: Full Color */}
      <img
        src={src}
        alt={alt}
        className={`block w-full pointer-events-none brightness-110 saturate-150 ${imgClassName}`}
        referrerPolicy="no-referrer"
      />

      {/* Top Layer: Grayscale with Mask */}
      <img
        ref={grayscaleRef}
        src={src}
        alt={alt}
        className={`absolute inset-0 block w-full grayscale pointer-events-none ${imgClassName}`}
        style={{
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
        }}
        referrerPolicy="no-referrer"
      />

      {/* Custom Cursor */}
      {isHovered && (
        <>
          <div
            ref={cursorRef}
            className="w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-50"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              willChange: 'transform',
            }}
          />
        </>
      )}
    </div>
  );
};

export default ColorRevealImage;
