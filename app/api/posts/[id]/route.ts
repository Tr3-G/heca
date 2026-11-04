import { NextResponse } from 'next/server';
import { getPostById, deletePost, updatePost } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

function checkAuth(req: Request) {
  return getAuthFromRequest(req);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if query param ?noIncrement=1 is passed (e.g. for admin preview), else increment view
    const url = new URL(req.url);
    const noIncrement = url.searchParams.get('noIncrement') === 'true';

    const post = await getPostById(id, !noIncrement);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = checkAuth(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updatePost(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Post updated successfully', post: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  return PUT(req, props);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = checkAuth(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deletePost(id);
    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
