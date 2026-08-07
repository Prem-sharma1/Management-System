import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  try {
    let resolvedParams = context?.params;
    if (resolvedParams && typeof resolvedParams.then === 'function') {
      resolvedParams = await resolvedParams;
    }
    
    // Extract filename from resolvedParams or URL path fallback
    let filename = resolvedParams?.filename;
    if (!filename && request.url) {
      const urlObj = new URL(request.url);
      const parts = urlObj.pathname.split('/uploads/');
      if (parts.length > 1) {
        filename = parts[1];
      }
    }

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Prevent directory traversal and decode URI component
    const decodedFilename = decodeURIComponent(filename);
    const safeFilename = path.basename(decodedFilename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);

    try {
      await fs.access(filePath);
    } catch (err) {
      return NextResponse.json({ error: 'File not found', filePath, errMessage: err.message, cwd: process.cwd(), filename }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);

    // Determine content-type header
    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.webm':
        contentType = 'video/webm';
        break;
      case '.mov':
        contentType = 'video/quicktime';
        break;
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Error serving upload file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
