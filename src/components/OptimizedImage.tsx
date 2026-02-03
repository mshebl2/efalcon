/**
 * Optimized Image Component Wrapper
 * Automatically adds blur placeholders and optimal loading settings
 * Handles GridFS images by bypassing Next.js optimization to avoid 400 errors
 */

import Image, { ImageProps } from 'next/image';
import { getBlurDataURL } from '@/lib/blur-placeholder';

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  /**
   * Whether to use blur placeholder (default: true)
   */
  useBlur?: boolean;
  /**
   * Custom blur data URL (optional, will auto-generate if not provided)
   */
  customBlurDataURL?: string;
}

/**
 * Check if a URL is a GridFS image (API route)
 */
function isGridFSImage(src: string | object): boolean {
  if (typeof src !== 'string') return false;
  return src.includes('/api/gridfs/');
}

/**
 * Optimized Image component with automatic blur placeholder
 * GridFS images bypass Next.js optimization to avoid 400 errors
 * 
 * Usage:
 * ```tsx
 * <OptimizedImage 
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   width={800}
 *   height={600}
 *   priority={true} // For above-the-fold images
 * />
 * ```
 */
export function OptimizedImage({
  useBlur = true,
  customBlurDataURL,
  src,
  alt,
  quality = 85,
  ...props
}: OptimizedImageProps) {
  // Check if this is a GridFS image
  const isGridFS = isGridFSImage(src);

  // Don't use blur for GridFS images (they come from API routes)
  const shouldUseBlur = useBlur && !isGridFS;

  const blurDataURL = shouldUseBlur
    ? customBlurDataURL || getBlurDataURL(typeof src === 'string' ? src : '')
    : undefined;

  return (
    <Image
      src={src}
      alt={alt}
      quality={quality}
      placeholder={shouldUseBlur ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      // Disable Next.js optimization for GridFS images to avoid 400 errors
      unoptimized={isGridFS}
      {...props}
    />
  );
}

/**
 * Hero Image - Optimized for large above-the-fold images
 */
export function HeroImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      priority
      quality={90}
      sizes="100vw"
      {...props}
    />
  );
}

/**
 * Card Image - Optimized for card/thumbnail images
 */
export function CardImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      quality={80}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loading="lazy"
      {...props}
    />
  );
}

/**
 * Background Image - Optimized for background images
 */
export function BackgroundImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      quality={75}
      fill
      style={{ objectFit: 'cover' }}
      {...props}
    />
  );
}

/**
 * Icon Image - Optimized for small icons and logos
 */
export function IconImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      quality={90}
      useBlur={false} // Icons don't need blur
      {...props}
    />
  );
}
