import { NextResponse } from 'next/server';
import { getAllStaff, createStaff, getStaffByEmail } from '@/lib/db';
import { getSession } from '@/lib/auth';

function checkAuth(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  let cookieToken = '';
  const match = cookieHeader.match(/heca_session=([^;]+)/);
  if (match) cookieToken = match[1];

  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token') || cookieToken;
  return getSession(authHeader);
}

export async function GET(req: Request) {
  const session = checkAuth(req);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const staffList = await getAllStaff();
    return NextResponse.json({ success: true, staff: staffList });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = checkAuth(req);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Only logged in staff can add staff.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const phone = (body.phone || '').trim();
    const password = (body.password || '').trim();
    const role = (body.role || 'staff').trim();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, phone number, and password are all required.' },
        { status: 400 }
      );
    }

    const existing = await getStaffByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A staff member with this email already exists.' },
        { status: 409 }
      );
    }

    const newStaff = await createStaff({ name, email, phone, password, role });
    return NextResponse.json({ success: true, staff: newStaff }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
