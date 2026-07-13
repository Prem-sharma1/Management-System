import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const deliveryDbId = parseInt(idParam);
    if (isNaN(deliveryDbId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { status, workingOn, notes, postDate } = await request.json();

    const updatedDelivery = await prisma.clientDelivery.update({
      where: { id: deliveryDbId },
      data: { status, workingOn, notes, postDate }
    });

    return NextResponse.json({ success: true, delivery: updatedDelivery });
  } catch (error) {
    console.error('Client delivery PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const deliveryDbId = parseInt(idParam);
    if (isNaN(deliveryDbId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.clientDelivery.delete({
      where: { id: deliveryDbId }
    });

    return NextResponse.json({ success: true, message: 'Delivery record deleted' });
  } catch (error) {
    console.error('Client delivery DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
