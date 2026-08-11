import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
