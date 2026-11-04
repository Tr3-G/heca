import { NextResponse } from 'next/server';
import { getNominationStats } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') || req.headers.get('x-admin-token');
  const session = getSession(authHeader);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await getNominationStats();
    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
