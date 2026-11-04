import { NextResponse } from 'next/server';
import { deleteStaff } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

function checkAuth(req: Request) {
  return getAuthFromRequest(req);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = checkAuth(req);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (String(session.id) === String(id)) {
    return NextResponse.json({ success: false, error: 'Cannot delete your own account.' }, { status: 400 });
  }

  try {
    await deleteStaff(id);
    return NextResponse.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
