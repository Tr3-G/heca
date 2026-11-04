import { NextResponse } from 'next/server';
import { getNominations, createNomination } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const session = getAuthFromRequest(req);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const list = await getNominations({ status, category, search });
    return NextResponse.json({
      success: true,
      count: list.length,
      nominations: list,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nomineeName,
      nomineeEmail,
      nomineePhone,
      organisation,
      category,
      biography,
      achievements,
      impact,
      reasons,
      supporting,
      nominatorName,
      nominatorEmail,
      nominatorPhone,
    } = body;

    if (!nomineeName || !nomineeName.trim()) {
      return NextResponse.json({ success: false, error: 'Nominee full name is required.' }, { status: 400 });
    }
    if (!category || !category.trim()) {
      return NextResponse.json({ success: false, error: 'Award category is required.' }, { status: 400 });
    }
    if (!nominatorName || !nominatorName.trim()) {
      return NextResponse.json({ success: false, error: 'Nominator full name is required.' }, { status: 400 });
    }

    const created = await createNomination({
      nomineeName: nomineeName.trim(),
      nomineeEmail: (nomineeEmail || '').trim(),
      nomineePhone: (nomineePhone || '').trim(),
      organisation: (organisation || '').trim(),
      category: category.trim(),
      biography: (biography || '').trim(),
      achievements: (achievements || '').trim(),
      impact: (impact || '').trim(),
      reasons: (reasons || '').trim(),
      supporting: (supporting || '').trim(),
      nominatorName: nominatorName.trim(),
      nominatorEmail: (nominatorEmail || '').trim(),
      nominatorPhone: (nominatorPhone || '').trim(),
      status: 'Pending Review',
    });

    return NextResponse.json({
      success: true,
      message: 'Nomination recorded successfully in the review system!',
      nomination: created,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating nomination:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
