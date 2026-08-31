import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes, followUpDate, expectedValue, leadSource } = body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (expectedValue !== undefined) updateData.expectedValue = expectedValue ? parseFloat(expectedValue) : null;
    if (leadSource !== undefined) updateData.leadSource = leadSource;

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
    const { id } = await params;

    await prisma.callRecord.delete({
      where: { id: parseInt(id, 10) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete call error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}