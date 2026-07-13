import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const updateResult = await prisma.clientTask.updateMany({
      where: {
        workingOn: 'Danish'
      },
      data: {
        workingOn: 'Danish Khan'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updateResult.count} tasks to match Danish Khan's exact name.`
    });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
