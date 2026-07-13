import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    if (!since) {
      return NextResponse.json({ error: 'Missing since parameter' }, { status: 400 });
    }

    const recentLogs = await prisma.attendance.findMany({
      where: {
        createdAt: {
          gt: new Date(since),
        },
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ logs: recentLogs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recent attendance:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
