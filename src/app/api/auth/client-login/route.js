import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const cleanInput = clientId.trim();

    // 1. Try exact or case-insensitive match
    let client = await prisma.client.findFirst({
      where: {
        clientId: { equals: cleanInput, mode: 'insensitive' }
      }
    });

    // 2. Fallback: try padded ID format if user typed AID-4 or 4 (e.g., AID-0004)
    if (!client) {
      const match = cleanInput.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        const paddedId = `AID-${num.toString().padStart(4, '0')}`;
        client = await prisma.client.findFirst({
          where: {
            clientId: { equals: paddedId, mode: 'insensitive' }
          }
        });
      }
    }

    if (!client) {
      return NextResponse.json({ error: 'Client ID not found' }, { status: 404 });
    }

    if (!client.active) {
      return NextResponse.json({ error: 'This client account is inactive' }, { status: 403 });
    }

    // Establish client session, clear staff session
    const cookieStore = await cookies();
    cookieStore.set('clientId', client.clientId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    cookieStore.delete('userId');

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        clientId: client.clientId,
        businessName: client.businessName,
        clientName: client.clientName,
        email: client.email
      }
    });
  } catch (error) {
    console.error('Client login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
