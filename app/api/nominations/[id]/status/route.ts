import { NextResponse } from 'next/server';
import { updateNominationStatus } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
  const session = getSession(authHeader);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    const updated = await updateNominationStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Nomination not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Nomination status updated successfully',
      nomination: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
