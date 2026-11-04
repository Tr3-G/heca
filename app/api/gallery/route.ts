import { NextResponse } from 'next/server';
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from '@/lib/db';
import { getSession } from '@/lib/auth';

function checkAuth(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  let cookieToken = '';
  const match = cookieHeader.match(/heca_session=([^;]+)/);
  if (match) cookieToken = match[1];

  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token') || cookieToken;
  return getSession(authHeader);
}

export async function GET() {
  try {
    const images = await getGalleryImages();
    return NextResponse.json(images);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = checkAuth(req);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    let { driveId, name, alt } = body;

    if (!driveId) {
      return NextResponse.json({ success: false, error: 'Photo identifier or URL is required.' }, { status: 400 });
    }

    // Clean Google drive id if full URL provided
    if (driveId.includes('/file/d/')) {
      const match = driveId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) driveId = match[1];
    } else if (driveId.includes('id=')) {
      const match = driveId.match(/id=([a-zA-Z0-9_-]+)/);
      if (match) driveId = match[1];
    }

    await addGalleryImage(driveId.trim(), name || 'Event Photo', alt || 'Her Excellence Conference photograph');
    return NextResponse.json({ success: true, message: 'Image registered to gallery successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = checkAuth(req);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Photo ID is required.' }, { status: 400 });
    }

    await deleteGalleryImage(id);
    return NextResponse.json({ success: true, message: 'Image removed from gallery.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
