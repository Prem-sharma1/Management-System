import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ct = await prisma.clientTask.findMany();
    
    const workingOnList = ct.map(t => t.workingOn).filter(Boolean);
    const uniqueWorkingOn = [...new Set(workingOnList)];

    return NextResponse.json({ 
      uniqueWorkingOn,
      count: ct.length 
    });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
