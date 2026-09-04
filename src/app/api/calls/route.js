import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const salesPersonId = url.searchParams.get('salesPersonId');

    const whereClause = salesPersonId ? { salesPersonId: parseInt(salesPersonId, 10) } : {};

    const calls = await prisma.callRecord.findMany({
      where: whereClause,
      include: {
        salesPerson: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            department: true,
            designation: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { callDate: 'desc' }
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Fetch calls error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { clientName, phoneNumber, salesPersonId, notes, status, followUpDate, expectedValue, leadSource } = body;

    if (!clientName || !phoneNumber || !salesPersonId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCall = await prisma.callRecord.create({
      data: {
        clientName,
        phoneNumber,
        salesPersonId: parseInt(salesPersonId, 10),
        notes: notes || '',
        status: status || 'PENDING',
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        expectedValue: expectedValue ? parseFloat(expectedValue) : null,
        leadSource: leadSource || null
      }
    });

    return NextResponse.json({ call: newCall }, { status: 201 });
  } catch (error) {
    console.error('Create call error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}