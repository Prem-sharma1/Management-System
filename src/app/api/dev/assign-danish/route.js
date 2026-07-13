import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ct = await prisma.clientTask.findMany({
    select: { id: true, taskId: true, workingOn: true, taskTitle: true, date: true, businessName: true, status: true, service: true }
  });
  return NextResponse.json({ count: ct.length, tasks: ct });
}
