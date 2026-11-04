import { NextResponse } from 'next/server';
import { verifyStaffCredentials, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || body.username || '').trim();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Username and password are required.' },
        { status: 400 }
      );
    }

    const staff = await verifyStaffCredentials(email, password);
    if (!staff) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    const token = createSession(staff);

    const res = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
      },
    });

    res.cookies.set('heca_session', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
