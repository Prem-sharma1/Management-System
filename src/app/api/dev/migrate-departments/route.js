import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const updates = [
      { from: 'Engineering', to: 'Software Development' },
      { from: 'Marketing', to: 'Social Media Marketing' },
      { from: 'Design', to: 'Graphics' }
    ];

    const results = [];
    for (const item of updates) {
      const res = await prisma.user.updateMany({
        where: { department: item.from },
        data: { department: item.to }
      });
      results.push({ from: item.from, to: item.to, count: res.count });
    }

    return NextResponse.json({
      success: true,
      message: 'Departments migrated successfully in database.',
      results
    });
  } catch (error) {
    console.error('Migrate departments error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
