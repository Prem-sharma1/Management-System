import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({ where: { name: { contains: 'Rama' } } });
    return NextResponse.json({ users });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
