import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({ where: { assignedToId: 23 } });
    return NextResponse.json({ tasks });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
