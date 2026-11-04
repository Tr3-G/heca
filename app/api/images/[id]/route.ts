import { NextResponse } from 'next/server';
import { getMediaFile } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const media = await getMediaFile(id);

    if (!media || !media.data) {
      return new NextResponse('Image not found', { status: 404 });
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
    console.error('Error streaming image bytes:', err);
    return new NextResponse('Error loading image', { status: 500 });
  }
}
