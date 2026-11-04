import { NextResponse } from 'next/server';
import { removeSession } from '@/lib/auth';

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  let cookieToken = '';
  const match = cookieHeader.match(/heca_session=([^;]+)/);
  if (match) cookieToken = match[1];

  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token') || cookieToken;
  removeSession(authHeader);

  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.delete('heca_session');
  return res;
}
