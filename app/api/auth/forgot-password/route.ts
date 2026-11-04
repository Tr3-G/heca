import { NextResponse } from 'next/server';
import { handleForgotPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered staff email address.' },
        { status: 400 }
      );
    }

    const result = await handleForgotPassword(email);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      phone: result.phone,
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
