'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import dynamic from 'next/dynamic';
import { PresenceImage } from '@/components/PresenceImage';
import { useState, useRef, useEffect, useMemo } from 'react';
import { FadeInOnScroll, ParallaxWrapper } from '@/components/ParallaxWrapper';
import { useLanguage } from '@/contexts/LanguageContext';

// THREE.TOUCH constants - use numeric values to avoid importing THREE
// These values match Three.js internal constants
const TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };

// Use the same real globe library as AboutSection
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

type PresenceLevel = 'active' | 'expanding' | 'partnership';

type Marker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  level: PresenceLevel;
};

const ACTIVE_COUNTRIES: Marker[] = [
  { id: 'sa', name: 'Saudi Arabia', lat: 23.8859, lng: 45.0792, level: 'active' },
  { id: 'iq', name: 'Iraq', lat: 33.2232, lng: 43.6793, level: 'active' },
  { id: 'eg', name: 'Egypt', lat: 26.0975, lng: 30.0444, level: 'active' },
  { id: 'tn', name: 'Tunisia', lat: 33.8869, lng: 9.5375, level: 'active' }
];

const EXPANDING_COUNTRIES: Marker[] = [
  { id: 'ma', name: 'Morocco', lat: 31.6295, lng: -7.9811, level: 'expanding' },
  { id: 'mr', name: 'Mauritania', lat: 21.0079, lng: -10.9408, level: 'expanding' },
  { id: 'ng', name: 'Nigeria', lat: 9.0765, lng: 7.3986, level: 'expanding' },
  { id: 'id', name: 'Indonesia', lat: -0.7893, lng: 113.9213, level: 'expanding' }
];

const PARTNERSHIP_COUNTRIES: Marker[] = [
  { id: 'us', name: 'USA', lat: 39.8283, lng: -98.5795, level: 'partnership' },
  { id: 'eu', name: 'Europe', lat: 54.5260, lng: 15.2551, level: 'partnership' },
  { id: 'my', name: 'Malaysia', lat: 4.2105, lng: 101.9758, level: 'partnership' }
];

// Status labels will be handled by translation system

export function PresenceSection() {
  const { t } = useLanguage();

  const STATUS_LABELS = {
    active: t('about.statusLabels.active'),
    expanding: t('about.statusLabels.expanding'),
    partnership: t('about.statusLabels.partnership')
  };
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<{
    pointOfView: (view: { lat: number; lng: number; altitude: number }, ms?: number) => void;
  } | null>(null);
  const [activeCountry, setActiveCountry] = useState<Marker | null>(ACTIVE_COUNTRIES[0]);
  const [isMobile, setIsMobile] = useState(false);

  const points = useMemo(() => {
    // Different sizes by presence level
    const withSize = (m: Marker): Marker & { size: number } => {
      const sizeByLevel: Record<PresenceLevel, number> = {
        active: 1.6,
        expanding: 1.2,
        partnership: 0.9
      };
      return { ...m, size: sizeByLevel[m.level] };
    };
    return [...ACTIVE_COUNTRIES, ...EXPANDING_COUNTRIES, ...PARTNERSHIP_COUNTRIES].map(withSize);
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const set = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: 23.8859, lng: 45.0792, altitude: 1.2 }, 0);
  }, [size.w, size.h]);

  // Enhanced mobile-optimized globe controls
  useEffect(() => {
    const globeAny = globeRef.current as unknown as { controls?: () => any } | null;
    const controls = globeAny && typeof globeAny.controls === 'function' ? globeAny.controls() : null;
    if (!controls) return;

    if (isMobile) {
      // Mobile-optimized settings for better performance
      controls.enableZoom = true;
      controls.enablePan = false; // Disable pan on mobile for better scroll performance
      controls.enableRotate = true;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1; // Increased damping for smoother mobile experience

      // Mobile-optimized zoom settings
      controls.zoomSpeed = 0.8; // Reduced for better control
      controls.minDistance = 150; // Increased minimum distance
      controls.maxDistance = 400; // Reduced maximum distance

      // Configure touch controls for mobile devices
      if (controls.touches) {
        controls.touches.ONE = TOUCH.ROTATE;
        controls.touches.TWO = TOUCH.DOLLY_PAN;
      }

      // Mobile-specific performance settings
      controls.enableKeys = false;
      controls.panSpeed = 0.5; // Reduced pan speed
      controls.rotateSpeed = 0.3; // Reduced rotation speed for smoother scrolling

      // Reduce update frequency on mobile
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.5;
    } else {
      // Desktop settings
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.enableRotate = true;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      controls.zoomSpeed = 1.0;
      controls.minDistance = 100;
      controls.maxDistance = 500;

      if (controls.touches) {
        controls.touches.ONE = TOUCH.ROTATE;
        controls.touches.TWO = TOUCH.DOLLY_PAN;
      }

      controls.enableKeys = false;
      controls.panSpeed = 0.8;
      controls.rotateSpeed = 0.5;
    }
  }, [size.w, size.h, isMobile]);

  return (
    <>
      {/* Presence Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/8 to-transparent"></div>
          {/* Subtle geometric pattern - hidden on mobile, visible on md and up */}
          <div className="absolute inset-0 hidden md:block" style={{
            backgroundImage: `
              radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0),
              radial-gradient(circle at 2px 2px, rgba(255,215,0,0.1) 1px, transparent 0)
            `,
            backgroundSize: '50px 50px, 100px 100px',
            backgroundPosition: '0 0, 25px 25px'
          }}></div>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          <FadeInOnScroll direction="up" delay={0.2}>
            <div className="text-center mb-8 md:mb-12 lg:mb-16">
              {/* Enhanced title container */}
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/20 p-6 md:p-8 lg:p-12 shadow-[0_15px_30px_rgba(0,0,0,0.2)] md:shadow-[0_20px_40px_rgba(0,0,0,0.3)] mb-6 md:mb-8">
                {/* Decorative accent line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full"></div>

                <h2 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-[24px] md:text-[32px] lg:text-[48px] text-white mb-3 md:mb-4 drop-shadow-lg">
                  {t('about.title')}
                </h2>
                <p className="font-['ADLaM_Display:Regular',_sans-serif] text-[14px] md:text-[16px] lg:text-[20px] text-white/90 max-w-3xl mx-auto drop-shadow-md">
                  {t('about.description')}
                </p>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Our Presence Around the World Image - Optimized for Mobile & PC */}
          <FadeInOnScroll direction="up" delay={0.3}>
            <div className="text-center mb-12 md:mb-16">
              <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8">
                {/* Enhanced container optimized for 1123x793 aspect ratio */}
                <div className="relative rounded-2xl md:rounded-3xl border-2 border-white/30 shadow-[0_20px_40px_rgba(0,0,0,0.3)] md:shadow-[0_25px_50px_rgba(0,0,0,0.4)] overflow-hidden bg-white/10 backdrop-blur-sm p-3 md:p-6 lg:p-8">
                  {/* Container with proper aspect ratio for 1123x793 image */}
                  <div className="relative w-full" style={{ aspectRatio: '1123/793' }}>

                    {/* Optimized presence image */}
                    <PresenceImage
                      src="/our presence around .png"
                      alt="Our Presence Around the World - Ebdaa Falcon Global Reach"
                    />
                  </div>

                  {/* Optional caption for better accessibility */}
                  <div className="mt-4 md:mt-6">
                    <p className="text-sm md:text-base text-white/80 font-medium">
                      {t('about.presence.globalReach.caption')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 md:gap-8 lg:gap-12 items-start">
            {/* Enhanced Real 3D Globe */}
            <ParallaxWrapper speed={0.3} direction="left">
              <div className="order-2 lg:order-1">
                <div
                  className="relative rounded-2xl md:rounded-3xl border-2 border-white/30 shadow-[0_20px_40px_rgba(0,0,0,0.3)] md:shadow-[0_25px_50px_rgba(0,0,0,0.4)] overflow-hidden bg-white/10 backdrop-blur-sm"
                  style={{
                    backgroundColor: '#0a0e1a',
                    backgroundImage:
                      'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                    backgroundSize: '3px 3px, 6px 6px',
                    backgroundPosition: '0 0, 1px 1px'
                  }}
                >
                  <div ref={containerRef} className={`relative aspect-[4/3] sm:aspect-[1/1] lg:aspect-[1/1] min-h-[300px] md:min-h-[400px] ${isMobile ? 'mobile-optimized-scroll' : ''}`}>
                    <Globe
                      ref={globeRef as unknown as any}
                      height={size.h}
                      width={size.w}
                      backgroundColor="rgba(0,0,0,0)"
                      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                      bumpImageUrl={isMobile ? undefined : "//unpkg.com/three-globe/example/img/earth-topology.png"} // Disable bump map on mobile for performance
                      pointsData={points as unknown as object[]}
                      pointLat={((d: any) => (d as Marker).lat) as unknown as any}
                      pointLng={((d: any) => (d as Marker).lng) as unknown as any}
                      pointAltitude={() => 0.02}
                      pointColor={(() => '#EFC132') as unknown as any}
                      pointRadius={((d: any) => (d as { size: number }).size * (isMobile ? 0.2 : 0.28)) as unknown as any} // Smaller points on mobile
                      labelsData={isMobile ? [] : points as unknown as object[]} // Disable labels on mobile for performance
                      labelLat={((d: any) => (d as Marker).lat) as unknown as any}
                      labelLng={((d: any) => (d as Marker).lng) as unknown as any}
                      labelText={((d: any) => (d as Marker).name) as unknown as any}
                      labelSize={() => 1.8}
                      labelColor={() => 'white'}
                      labelDotRadius={() => 0.4}
                      labelDotOrientation={() => 'top'}
                      onPointClick={(point: any) => {
                        const marker = point as Marker;
                        setActiveCountry(marker);
                      }}
                      // Mobile-specific performance optimizations
                      rendererConfig={{
                        antialias: !isMobile, // Disable antialiasing on mobile for performance
                        alpha: true,
                        powerPreference: isMobile ? "low-power" : "high-performance"
                      }}
                    />
                  </div>

                  {/* Decorative corner elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/40 rounded-full"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </ParallaxWrapper>

            {/* Enhanced Country Information Panel */}
            <FadeInOnScroll direction="right" delay={0.4}>
              <div className="order-1 lg:order-2">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:shadow-[0_25px_50px_rgba(0,0,0,0.3)] border border-white/30 p-6 md:p-8 lg:p-10">
                  {/* Decorative accent line */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#EFC132]/60 to-transparent rounded-full"></div>

                  {/* Enhanced Legend */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-base md:text-lg text-[#EFC132] mb-4 md:mb-6 drop-shadow-sm">
                      {t('about.presence.presenceStatus')}
                    </h3>
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#EFC132] shadow-lg flex-shrink-0"></div>
                        <span className="text-xs md:text-sm font-medium text-gray-700">{t('about.presence.strongPresence')}</span>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#EFC132] shadow-lg flex-shrink-0"></div>
                        <span className="text-xs md:text-sm font-medium text-gray-700">{t('about.presence.expanding')}</span>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#EFC132] shadow-lg flex-shrink-0"></div>
                        <span className="text-xs md:text-sm font-medium text-gray-700">{t('about.presence.partnerships')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Country Info */}
                  {activeCountry && (
                    <div className="border-t pt-4 md:pt-6">
                      <h4 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-lg md:text-xl text-[#EFC132] mb-2">
                        {activeCountry.name}
                      </h4>
                      <div className="space-y-2 text-xs md:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('about.status')}:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-[#EFC132]/10 text-[#EFC132]`}>
                            {STATUS_LABELS[activeCountry.level]}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Statistics */}
                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t">
                    <h4 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-base md:text-lg text-[#EFC132] mb-3 md:mb-4">
                      {t('about.globalReach')}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-[#EFC132]">11</div>
                        <div className="text-xs text-gray-600">{t('about.countries')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-[#EFC132]">4</div>
                        <div className="text-xs text-gray-600">{t('about.continents')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInOnScroll>
          </div>

          {/* Enhanced Regional Highlights */}
          <FadeInOnScroll direction="up" delay={0.6}>
            <div className="mt-12 md:mt-16 lg:mt-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.15)] md:shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-white/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] md:hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3 md:mr-4 shadow-lg flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-base md:text-lg text-[#EFC132]">
                      {t('about.presence.strongPresenceTitle')}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {t('about.presence.strongPresence')}
                  </p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.15)] md:shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-white/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] md:hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-3 md:mr-4 shadow-lg flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-base md:text-lg text-[#EFC132]">
                      {t('about.presence.expandingTitle')}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {t('about.presence.expanding')}
                  </p>
                </div>

                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.15)] md:shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-white/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] md:hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3 md:mr-4 shadow-lg flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-['Alfa_Slab_One:Bold',_sans-serif] font-bold text-base md:text-lg text-[#EFC132]">
                      {t('about.presence.partnershipsTitle')}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {t('about.presence.partnerships')}
                  </p>
                </div>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Elegant Wave Separator */}
      <div className="relative w-full h-24 md:h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#EFC132] to-white">
          {/* Animated Wave */}
          <svg
            className="absolute bottom-0 w-full h-16 md:h-20 text-white"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C300,120 600,0 900,60 C1050,90 1200,30 1200,60 L1200,120 L0,120 Z"
              fill="currentColor"
              className="animate-pulse"
            />
          </svg>

          {/* Secondary Wave */}
          <svg
            className="absolute bottom-0 w-full h-12 md:h-16 text-white/80"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ animationDelay: '0.5s' }}
          >
            <path
              d="M0,80 C400,40 800,100 1200,80 L1200,120 L0,120 Z"
              fill="currentColor"
              className="animate-pulse"
            />
          </svg>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-1/4 w-2 h-2 bg-yellow-300/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-8 right-1/3 w-1 h-1 bg-yellow-400/80 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-6 left-2/3 w-1.5 h-1.5 bg-yellow-300/70 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-10 right-1/4 w-1 h-1 bg-yellow-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
    </>
  );
}
