import { NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const user = getAuthFromRequest(req);

  if (user) {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      username: user.name || user.email,
    });
  }

  return NextResponse.json({ authenticated: false });
}
