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

    let deliveries = await prisma.clientDelivery.findMany({
      orderBy: { postDate: 'desc' }
    });

    if (!deliveries || deliveries.length === 0) {
      const clientTasks = await prisma.clientTask.findMany({
        orderBy: { id: 'desc' }
      });

      deliveries = clientTasks.map(t => ({
        id: t.id,
        deliveryId: t.taskId || `DEL-${t.id}`,
        clientId: t.clientId,
        clientName: t.businessName || t.clientId,
        postType: t.postType || 'Content',
        postDate: t.date,
        status: ['DONE', 'Completion', 'Completed', 'Posted'].includes(t.status) ? 'Posted' : t.status === 'Not Started' ? 'Pending' : t.status,
        linkedTaskId: t.taskId,
        workingOn: t.workingOn || '',
        notes: t.notes || t.taskTitle,
        createdAt: t.createdAt
      }));
    }

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

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const delRes = await prisma.clientDelivery.deleteMany({});
    const taskRes = await prisma.clientTask.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${delRes.count} deliveries and ${taskRes.count} client tasks`
    });
  } catch (error) {
    console.error('Global client deliveries DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
