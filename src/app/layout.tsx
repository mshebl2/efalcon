import type { ReactNode } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { ResponsiveScrollProgressIndicator } from '@/components/ScrollProgressIndicator';
import { ImagePreloader, CRITICAL_IMAGES } from '@/components/ImagePreloader';
import { MobileScrollOptimizer } from '@/components/MobileScrollOptimizer';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { MobilePerformanceMonitor } from '@/components/MobilePerformanceMonitor';
import { MobileResourcePreloader, MOBILE_CRITICAL_IMAGES } from '@/components/MobileResourcePreloader';
import { fonts } from '@/lib/fonts';
import './globals.css';

export const metadata = {
  title: {
    default: 'Ebdaa Falcon | ابداع فالكون – Oil & Gas Projects and Logistics',
    template: '%s | Ebdaa Falcon – ابداع فالكون',
  },
  description: 'Ebdaa Falcon (ابداع فالكون) شركة متخصصة في مشاريع النفط والغاز، تخزين البترول، الخدمات اللوجستية، وتداول المشتقات النفطية في المملكة العربية السعودية والشرق الأوسط وأفريقيا.',

  keywords: [
    'Ebdaa Falcon',
    'ابداع فالكون',
    'مشاريع النفط والغاز',
    'تخزين البترول',
    'الخدمات اللوجستية',
    'مشتقات نفطية',
    'Oil and Gas Projects',
    'Petroleum Storage',
    'Logistics Services',
    'Saudi Arabia Oil Company',
    'Riyadh Oil and Gas',
  ],

  alternates: {
    canonical: 'https://www.efalcon.sa',
    languages: {
      ar: 'https://www.efalcon.sa',
      en: 'https://www.efalcon.sa',
    },
  },

  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    url: 'https://www.efalcon.sa',
    title: 'Ebdaa Falcon | ابداع فالكون – مشاريع النفط والغاز',
    description: 'مشاريع نفط وغاز متقدمة، منشآت تخزين البترول، ومراكز تداول استراتيجية في السعودية والشرق الأوسط.',

    images: [
      {
        url: '/logofirstsection.png',
        width: 1200,
        height: 630,
        alt: 'Ebdaa Falcon – ابداع فالكون',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Ebdaa Falcon | ابداع فالكون',
    description: 'Oil & Gas Projects, Petroleum Storage and Logistics Services in Saudi Arabia.',
    images: ['/logofirstsection.png'],
  },

  icons: {
    icon: [
      { url: '/logofirstsection.png', sizes: '32x32', type: 'image/png' },
      { url: '/logofirstsection.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/logofirstsection.png', sizes: '180x180' }],
  },
};

export const viewport = {
  themeColor: '#EFC132',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={fonts.className}>
      <head>
        {/* Critical resource hints for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link rel="preload" href="/logofirstsection.webp" as="image" type="image/webp" />
        <link rel="preload" href="/ourworkbanner.webp" as="image" type="image/webp" />

        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />

        {/* Schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Ebdaa Falcon | ابداع فالكون",
              "url": "https://www.efalcon.sa",
              "logo": "https://www.efalcon.sa/logofirstsection.png",
              "image": "https://www.efalcon.sa/logofirstsection.png",
              "description": "Ebdaa Falcon (ابداع فالكون) شركة متخصصة في مشاريع النفط والغاز، تخزين البترول، الخدمات اللوجستية، وتداول المشتقات النفطية في السعودية والشرق الأوسط وأفريقيا.",

              "telephone": "+966565145666",
              "areaServed": [
                {
                  "@type": "AdministrativeArea",
                  "name": "Riyadh"
                },
                {
                  "@type": "Country",
                  "name": "Saudi Arabia"
                },
                {
                  "@type": "Continent",
                  "name": "Africa"
                }
              ],

              "address": {
                "@type": "PostalAddress",
                "addressCountry": "SA",
                "addressRegion": "Riyadh"
              },

              "foundingDate": "2025",

              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Oil & Gas Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Petroleum Storage Facilities"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Oil & Gas Integrated Solutions"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Logistics & Marine Services"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Water Desalination & Alternative Energy"
                    }
                  }
                ]
              }
            }),
          }}
        />
      </head>

      <body className="antialiased">
        <PerformanceMonitor />
        <MobilePerformanceMonitor />
        <ImagePreloader images={CRITICAL_IMAGES} />
        <MobileResourcePreloader images={MOBILE_CRITICAL_IMAGES} />
        <MobileScrollOptimizer />
        <LanguageProvider>
          <ResponsiveScrollProgressIndicator />
          {children}
          <Footer />
          <FloatingActions />
        </LanguageProvider>
      </body>
    </html>
  );
}
