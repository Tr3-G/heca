import { NextResponse } from 'next/server';
import { getPosts, createPost } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthFromRequest(req);

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Staff authentication required to publish blog posts.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    let { title, author, date, excerpt, body: postBody, coverId } = body;

    if (!title || !postBody) {
      return NextResponse.json({ error: 'Title and body are required.' }, { status: 400 });
    }

    // Clean Google Drive link if pasted
    if (coverId && coverId.includes('/file/d/')) {
      const match = coverId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) coverId = match[1];
    } else if (coverId && coverId.includes('id=')) {
      const match = coverId.match(/id=([a-zA-Z0-9_-]+)/);
      if (match) coverId = match[1];
    }

    const created = await createPost({
      title,
      author: author || session.name || 'Secretariat',
      date,
      excerpt,
      body: postBody,
      coverId: coverId || null,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
