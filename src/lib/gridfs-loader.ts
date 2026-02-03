/**
 * Custom image loader for GridFS images
 * Bypasses Next.js image optimization for API routes to avoid 400 errors
 */

export default function gridfsLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) {
    // If it's a GridFS API route, return the URL directly without Next.js optimization
    if (src.includes('/api/gridfs/')) {
        return src;
    }

    // For other images, use Next.js default optimization
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}

/**
 * Check if a URL is a GridFS image
 */
export function isGridFSImage(src: string): boolean {
    return src.includes('/api/gridfs/');
}
