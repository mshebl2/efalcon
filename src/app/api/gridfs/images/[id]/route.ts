import { NextRequest } from 'next/server';
import { GridFSUtils } from '@/lib/gridfs';
import { ObjectId } from 'mongodb';

// Validate MongoDB ObjectId format (24 hex characters)
function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Next.js 15: params is now a Promise and must be awaited
    const { id: fileId } = await params;

    // Validate presence
    if (!fileId) {
      console.error('[GridFS] Missing file ID');
      return new Response('Missing id', { status: 400 });
    }

    // Validate ObjectId format BEFORE attempting database operations
    if (!isValidObjectId(fileId)) {
      console.error('[GridFS] Invalid ObjectId format:', fileId);
      return new Response('Invalid file ID format', { status: 400 });
    }

    // Get file info first to check existence and get content type
    const fileInfo = await GridFSUtils.getFileInfo(fileId);
    if (!fileInfo) {
      console.error('[GridFS] File not found:', fileId);
      return new Response('File not found', { status: 404 });
    }

    // Fetch file buffer
    const buffer = await GridFSUtils.downloadFile(fileId);
    const contentType = fileInfo.contentType || 'application/octet-stream';

    // Generate ETag for caching
    const crypto = require('crypto');
    const etag = crypto.createHash('md5').update(buffer).digest('hex');

    const uint8 = new Uint8Array(buffer);
    const blob = new Blob([uint8], { type: contentType });
    return new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache for 30 minutes at browser and CDN, allow brief SWR window
        'Cache-Control': 'public, s-maxage=1800, max-age=1800, stale-while-revalidate=600',
        'ETag': etag,
        'Vary': 'Accept-Encoding'
      }
    });
  } catch (e: any) {
    console.error('[GridFS] Error serving file:', e?.message || e);
    return new Response('Not found', { status: 404 });
  }
}


