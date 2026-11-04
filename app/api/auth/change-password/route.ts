import { NextResponse } from 'next/server';
import { getSession, handleChangePassword, verifyStaffCredentials } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
    const session = getSession(authHeader);

    const body = await req.json();
    const oldPassword = (body.oldPassword || body.currentPassword || '').trim();
    const newPassword = (body.newPassword || '').trim();
    const email = (body.email || '').trim();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    let staffId = session?.id;

    if (!staffId && email) {
      // Allow unauthenticated change if they provide email and valid current password (such as their temporary phone number)
      const staff = await verifyStaffCredentials(email, oldPassword);
      if (!staff) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or current temporary password.' },
          { status: 401 }
        );
      }
      staffId = staff.id;
    } else if (!staffId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in or provide email and current password.' },
        { status: 401 }
      );
    }

    if (!oldPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is required.' },
        { status: 400 }
      );
    }

    const result = await handleChangePassword(staffId, oldPassword, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Change password error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
