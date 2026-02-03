'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// THREE.TOUCH constants - use numeric values to avoid importing THREE
// These values match Three.js internal constants
const TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };

// react-globe.gl needs window; use dynamic import to avoid SSR
// Add loading component for better UX
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#EFC132] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Interactive Globe...</p>
      </div>
    </div>
  )
});

type Point = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

const COUNTRIES: Point[] = [
  { id: 'sa', name: 'saudi-arabia', lat: 23.8859, lng: 45.0792 },
  { id: 'ae', name: 'uae', lat: 23.4241, lng: 53.8478 },
  { id: 'kw', name: 'kuwait', lat: 29.3117, lng: 47.4818 },
  { id: 'bh', name: 'bahrain', lat: 26.0667, lng: 50.5577 },
  { id: 'qa', name: 'qatar', lat: 25.3548, lng: 51.1839 },
  { id: 'om', name: 'oman', lat: 21.4735, lng: 55.9754 },
  { id: 'jo', name: 'jordan', lat: 31.24, lng: 36.51 },
  { id: 'eg', name: 'egypt', lat: 26.8206, lng: 30.8025 }
];

export function GlobalPresenceGlobe() {
  const { t, language } = useLanguage();
  const points = useMemo(() => COUNTRIES.map(c => ({ ...c, size: 0.8 })), []);

  // Create translated country names
  const getCountryName = (countryKey: string) => {
    return t(`aboutUs.globalPresence.countries.${countryKey}`) || countryKey;
  };

  const translatedPoints = useMemo(() =>
    points.map(point => ({
      ...point,
      translatedName: getCountryName(point.name)
    })), [points, t, language]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<{
    pointOfView: (view: { lat: number; lng: number; altitude: number }, ms?: number) => void;
  } | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const set = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Center camera on MENA region once the globe is available
  useEffect(() => {
    if (!globeRef.current) return;
    // Center camera on Saudi Arabia by default
    globeRef.current.pointOfView({ lat: 23.8859, lng: 45.0792, altitude: 1.2 }, 0);
  }, [size.w, size.h]);

  // Enable pinch-to-zoom and panning for touch devices via OrbitControls
  useEffect(() => {
    const globeAny = globeRef.current as unknown as { controls?: () => any } | null;
    const controls = globeAny && typeof globeAny.controls === 'function' ? globeAny.controls() : null;
    if (!controls) return;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.zoomSpeed = 0.5;
    controls.minDistance = 120;
    controls.maxDistance = 400;

    // Ensure two-finger pinch to zoom and pan on mobile
    if (controls.touches) {
      controls.touches.ONE = TOUCH.ROTATE;
      controls.touches.TWO = TOUCH.DOLLY_PAN;
    }
  }, [size.w, size.h]);

  const flyTo = (lat: number, lng: number, altitude = 1.1) => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat, lng, altitude }, 1200);
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-3xl md:text-5xl text-[#EFC132] mb-4">{t('aboutUs.globalPresence.title') || 'Global Presence'}</h2>
          <p className="font-['Alice:Regular',_sans-serif] text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">{t('aboutUs.globalPresence.subtitle') || 'Interactive 3D globe showing our key regions and partnerships.'}</p>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 items-center">
          <div
            className="relative rounded-xl border border-white/10 shadow-md overflow-hidden"
            style={{
              backgroundColor: '#0a0e1a',
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '3px 3px, 6px 6px',
              backgroundPosition: '0 0, 1px 1px'
            }}
          >
            <div ref={containerRef} className="relative aspect-[16/9] md:aspect-[21/9]" style={{ touchAction: 'pan-y' }}>
              {/* globe component rendered client-side; casts keep TS quiet */}
              <Globe
                ref={globeRef as unknown as any}
                height={size.h}
                width={size.w}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                pointsData={translatedPoints as unknown as object[]}
                pointLat={((d: any) => (d as Point).lat) as unknown as any}
                pointLng={((d: any) => (d as Point).lng) as unknown as any}
                pointAltitude={() => 0.01}
                pointColor={() => '#FFD700'}
                pointRadius={((d: any) => (d as { size: number }).size * 0.2) as unknown as any}
                labelsData={translatedPoints as unknown as object[]}
                labelLat={((d: any) => (d as Point).lat) as unknown as any}
                labelLng={((d: any) => (d as Point).lng) as unknown as any}
                labelText={((d: any) => {
                  const point = d as Point;
                  // Always show English names on the globe for consistency
                  const englishNames: Record<string, string> = {
                    'saudi-arabia': 'Saudi Arabia',
                    'uae': 'UAE',
                    'kuwait': 'Kuwait',
                    'bahrain': 'Bahrain',
                    'qatar': 'Qatar',
                    'oman': 'Oman',
                    'jordan': 'Jordan',
                    'egypt': 'Egypt'
                  };
                  return englishNames[point.name] || point.name;
                }) as unknown as any}
                labelSize={1.6}
                labelColor="white"
                labelDotRadius={0.4}
                labelAltitude={0.02}
                atmosphereAltitude={0.15}
                enablePointerInteraction={true}
                onLabelClick={() => { }}
              />
            </div>
          </div>

          <div>
            <ul className="grid grid-cols-2 gap-3">
              {COUNTRIES.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => flyTo(c.lat, c.lng, 1.0)}
                    className="w-full text-left font-['Alice:Regular',_sans-serif] text-gray-800 bg-white border border-gray-200 rounded-md px-3 py-2 hover:border-[#EFC132] hover:bg-white"
                  >
                    {(() => {
                      // Always show English names for consistency
                      const englishNames: Record<string, string> = {
                        'saudi-arabia': 'Saudi Arabia',
                        'uae': 'UAE',
                        'kuwait': 'Kuwait',
                        'bahrain': 'Bahrain',
                        'qatar': 'Qatar',
                        'oman': 'Oman',
                        'jordan': 'Jordan',
                        'egypt': 'Egypt'
                      };
                      return englishNames[c.name] || c.name;
                    })()}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


