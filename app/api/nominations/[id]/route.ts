import { NextResponse } from 'next/server';
import { getNominationById, deleteNomination, updateNomination } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

function checkAuth(req: Request) {
  return getAuthFromRequest(req);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = checkAuth(req);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const nomination = await getNominationById(id);
    if (!nomination) {
      return NextResponse.json({ success: false, error: 'Nomination not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, nomination });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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
    const updated = await updateNomination(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Nomination not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Nomination updated successfully', nomination: updated });
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
    await deleteNomination(id);
    return NextResponse.json({ success: true, message: 'Nomination deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
