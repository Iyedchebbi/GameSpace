'use client';

import { useEffect, useRef } from 'react';

export default function SplineHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || loadedRef.current) return;
    loadedRef.current = true;

    const loadSpline = async () => {
      try {
        await import('@splinetool/viewer');

        const splineViewer = document.createElement('spline-viewer');
        splineViewer.setAttribute('url', 'https://prod.spline.design/Jak99yhk5zmC33TX/scene.splinecode');
        splineViewer.style.width = '100%';
        splineViewer.style.height = '100%';
        splineViewer.style.backgroundColor = 'transparent';
        
        containerRef.current?.appendChild(splineViewer);
      } catch (err) {
        console.error('Failed to load Spline:', err);
      }
    };

    loadSpline();
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-10" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/60 z-10" />
    </div>
  );
}
