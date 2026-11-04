import { NextResponse } from 'next/server';
import { getCachedMedia, setCachedMedia } from '@/lib/cache';
import { Pool } from 'pg';

let pool: Pool | null = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driveId = (searchParams.get('id') || '').trim();
    const width = searchParams.get('w') || '1000';

    if (!driveId) {
      return new NextResponse('Missing drive ID', { status: 400 });
    }

    const cacheKey = `gdrive_${driveId}`;
    const cached = getCachedMedia(cacheKey);
    if (cached) {
      return new NextResponse(cached.data as any, {
        status: 200,
        headers: {
          'Content-Type': cached.mimeType || 'image/jpeg',
          'Content-Length': String(cached.size || cached.data.length),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Check PostgreSQL media_files for already saved bytes
    if (pool) {
      try {
        const possibleFilenames = [
          `gdrive_${driveId}.jpg`,
          `gdrive_${driveId}`,
          driveId,
          `${driveId}.jpg`,
        ];
        if (driveId === '1TR55q6C-kk-IQy4BLXaIUkGIPsMOv-M0') {
          possibleFilenames.unshift('hero_background.jpg');
        }

        const dbRes = await pool.query(
          'SELECT data, mime_type, size FROM media_files WHERE filename = ANY($1) ORDER BY size DESC LIMIT 1',
          [possibleFilenames]
        );
        if (dbRes.rows.length > 0) {
          const row = dbRes.rows[0];
          setCachedMedia(cacheKey, {
            filename: cacheKey,
            mimeType: row.mime_type,
            data: row.data,
            size: row.size,
          });
          return new NextResponse(row.data, {
            status: 200,
            headers: {
              'Content-Type': row.mime_type || 'image/jpeg',
              'Content-Length': String(row.size),
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      } catch (err: any) {
        console.warn('DB check error in drive-proxy:', err.message);
      }
    }

    // Pull directly from Google Drive and convert to raw bytes
    const urls = [
      `https://lh3.googleusercontent.com/d/${driveId}=w${width}`,
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w${width}`,
    ];

    let imageBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        if (res.ok) {
          const ab = await res.arrayBuffer();
          if (ab.byteLength > 1000) {
            imageBuffer = Buffer.from(ab);
            mimeType = res.headers.get('content-type') || 'image/jpeg';
            break;
          }
        }
      } catch (e) {
        // Continue to fallback
      }
    }

    if (imageBuffer) {
      // Save converted bytes to PostgreSQL database
      if (pool) {
        try {
          await pool.query(
            `INSERT INTO media_files (filename, mime_type, data, size)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [cacheKey, mimeType, imageBuffer, imageBuffer.length]
          );
        } catch (dbErr: any) {
          console.warn('Failed to persist pulled gdrive bytes to DB:', dbErr.message);
        }
      }

      setCachedMedia(cacheKey, {
        filename: cacheKey,
        mimeType,
        data: imageBuffer,
        size: imageBuffer.length,
      });

      return new NextResponse(imageBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(imageBuffer.length),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Fallback placeholder SVG if Google Drive ID is completely inaccessible
    const fallbackSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#2b0f26"/>
        <circle cx="400" cy="300" r="180" fill="#4f1c47" opacity="0.4"/>
        <text x="50%" y="45%" text-anchor="middle" fill="#c8a04d" font-family="'Fraunces', serif" font-size="28" font-weight="bold">Her Excellence 2027</text>
        <text x="50%" y="54%" text-anchor="middle" fill="#faf5ec" font-family="'Work Sans', sans-serif" font-size="16">Event Photograph &middot; Abuja Edition</text>
      </svg>
    `.trim();

    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('drive-proxy fatal error:', err);
    return new NextResponse('Internal error loading image', { status: 500 });
  }
}
