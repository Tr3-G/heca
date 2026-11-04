import { NextResponse } from 'next/server';
import { deleteStaff } from '@/lib/db';
import { getSession } from '@/lib/auth';

function checkAuth(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  let cookieToken = '';
  const match = cookieHeader.match(/heca_session=([^;]+)/);
  if (match) cookieToken = match[1];

  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token') || cookieToken;
  return getSession(authHeader);
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
