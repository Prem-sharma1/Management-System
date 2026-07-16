import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tasks = await prisma.clientTask.findMany({
      where: {
        businessName: {
          contains: 'Broadband',
          mode: 'insensitive'
        }
      }
    });
    const deliveries = await prisma.clientDelivery.findMany({
      where: {
        clientName: {
          contains: 'Broadband',
          mode: 'insensitive'
        }
      }
    });
    return NextResponse.json({ tasksCount: tasks.length, tasks, deliveriesCount: deliveries.length, deliveries });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
