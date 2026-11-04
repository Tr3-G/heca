import { NextResponse } from 'next/server';
import { getDefaultGalleryImages, addGalleryImage } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
  const session = getSession(authHeader);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const defaults = getDefaultGalleryImages();
    let count = 0;
    for (const item of defaults) {
      await addGalleryImage(item.id, item.name, 'Her Excellence Conference & Awards photograph');
      count++;
    }

    return NextResponse.json({
      success: true,
      message: `Synchronized ${count} event photographs into the gallery.`,
      count,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
