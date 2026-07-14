import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const clientIdStr = cookieStore.get('clientId')?.value;

    if (!clientIdStr) {
      return NextResponse.json({ error: 'Unauthorized client session' }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { clientId: clientIdStr }
    });

    if (!client || !client.active) {
      return NextResponse.json({ error: 'Client account not found or inactive' }, { status: 404 });
    }

    const body = await request.json();
    const { type, rating, message } = body;

    if (!type || !message) {
      return NextResponse.json({ error: 'Feedback type and message are required' }, { status: 400 });
    }

    const feedback = await prisma.clientFeedback.create({
      data: {
        clientId: client.clientId,
        businessName: client.businessName,
        clientName: client.clientName || client.businessName,
        type,
        rating: type === 'Feedback' ? parseInt(rating) || 5 : null,
        message: message.trim(),
        status: 'Pending'
      }
    });

    // Write an audit log for the new concern or review
    await prisma.auditLog.create({
      data: {
        action: `Client "${client.businessName}" submitted a new ${type}`,
        performedByName: client.clientName || client.businessName,
        performedByRole: 'CLIENT'
      }
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Client feedback POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    const clientIdStr = cookieStore.get('clientId')?.value;

    if (userIdStr) {
      // Staff checking feedbacks (Admin/CEO)
      const user = await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
      if (!user || !['CEO', 'ADMIN'].includes(user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const feedbacks = await prisma.clientFeedback.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ feedbacks });
    } else if (clientIdStr) {
      // Client checking their own feedbacks
      const feedbacks = await prisma.clientFeedback.findMany({
        where: { clientId: clientIdStr },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ feedbacks });
    }

    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  } catch (error) {
    console.error('Client feedback GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
