import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const deliveries = await prisma.clientDelivery.findMany({
      select: {
        id: true,
        deliveryId: true,
        postDate: true,
        createdAt: true,
        clientName: true
      }
    });
    return NextResponse.json({ count: deliveries.length, deliveries });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
