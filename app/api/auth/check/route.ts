import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  let cookieToken = '';
  const match = cookieHeader.match(/heca_session=([^;]+)/);
  if (match) cookieToken = match[1];

  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token') || cookieToken;
  const session = getSession(authHeader);

  if (session) {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        phone: session.phone,
        role: session.role,
      },
      username: session.name || session.email,
    });
  }

  return NextResponse.json({ authenticated: false });
}
