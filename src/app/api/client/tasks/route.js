import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const clientId = cookieStore.get('clientId')?.value;

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized client session' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { clientId: clientId }
    });

    if (!client || !client.active) {
      return NextResponse.json({ error: 'Client account not found or inactive' }, { status: 404 });
    }

    // Retrieve tasks associated with this client
    const tasks = await prisma.clientTask.findMany({
      where: { clientId: clientId },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({
      client: {
        id: client.id,
        clientId: client.clientId,
        businessName: client.businessName,
        clientName: client.clientName,
        joiningDate: client.joiningDate,
        services: client.services,
        packageName: client.packageName,
        packageAmount: client.packageAmount,
        notes: client.notes,
        sector: client.sector,
        accountReady: client.accountReady
      },
      tasks
    });
  } catch (error) {
    console.error('Client portal tasks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
