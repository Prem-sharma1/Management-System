import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, notes } = body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedCall = await prisma.callRecord.update({
      where: { id: parseInt(id, 10) },
      data: updateData
    });

    return NextResponse.json({ call: updatedCall });
  } catch (error) {
    console.error('Update call error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await prisma.callRecord.delete({
      where: { id: parseInt(id, 10) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete call error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}