import { NextResponse } from 'next/server';
import { getMediaFile } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Media ID is required', { status: 400 });
    }

    const media = await getMediaFile(id);
    if (!media || !media.data) {
      return new NextResponse('Media not found', { status: 404 });
    }

    return new NextResponse(media.data as any, {
      status: 200,
      headers: {
        'Content-Type': media.mimeType || 'image/jpeg',
        'Content-Length': String(media.size || media.data.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    console.error('Error serving media bytes:', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
