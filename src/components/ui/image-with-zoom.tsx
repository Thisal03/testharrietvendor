'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ImageWithZoomProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  zoomScale?: number;
  children?: React.ReactNode;
}

export function ImageWithZoom({
  src,
  alt,
  width = 40,
  height = 40,
  className,
  zoomScale = 4,
  children
}: ImageWithZoomProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = React.useState(false);
  const imageRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPosition({ x, y });
  };

  const zoomPreview = isHovered && isMounted && (
    <div
      className="fixed pointer-events-none rounded-lg shadow-2xl border-2 border-white overflow-hidden"
      style={{
        left: `${position.x + (imageRef.current?.getBoundingClientRect().left || 0) + 20}px`,
        top: `${position.y + (imageRef.current?.getBoundingClientRect().top || 0) - 100}px`,
        width: `${width * zoomScale}px`,
        height: `${height * zoomScale}px`,
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 99999
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5" />
    </div>
  );

  return (
    <>
      <div
        ref={imageRef}
        className="relative inline-block cursor-zoom-in"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {children || (
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn('transition-opacity', className)}
          />
        )}
      </div>

      {/* Render zoomed preview using portal to body */}
      {isMounted && zoomPreview && createPortal(zoomPreview, document.body)}
    </>
  );
}

