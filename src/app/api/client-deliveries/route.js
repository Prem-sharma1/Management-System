import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const deliveries = await prisma.clientDelivery.findMany({
      orderBy: { postDate: 'desc' }
    });

    return NextResponse.json(
      { deliveries },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Global client deliveries GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
