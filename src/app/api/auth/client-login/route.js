import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanInput = email.toLowerCase().trim();

    // 1. Try exact or case-insensitive match
    let client = await prisma.client.findFirst({
      where: {
        email: { equals: cleanInput, mode: 'insensitive' }
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client email not found' }, { status: 404 });
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
