import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveMediaFile } from '@/lib/db';
import { sendJob } from '@/lib/queue';

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  let cookieToken = '';
  const match = cookieHeader.match(/heca_session=([^;]+)/);
  if (match) cookieToken = match[1];

  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token') || cookieToken;
  const session = getSession(authHeader);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert file to raw binary bytes (Buffer)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const filename = file.name || `image_${Date.now()}.jpg`;

    // Save binary bytes directly into PostgreSQL media_files table (BYTEA)
    const saved = await saveMediaFile(filename, mimeType, buffer);

    // Optional background optimization job via pg-boss
    await sendJob('media-process', {
      mediaId: saved.id,
      filename,
      size: buffer.length,
      mimeType,
    });

    return NextResponse.json({
      success: true,
      url: saved.url,
      id: saved.id,
      filename,
      size: buffer.length,
      mimeType,
      isBytes: true,
      message: 'Image converted to bytes and saved directly to database successfully.',
    });
  } catch (err: any) {
    console.error('Upload to bytes error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
