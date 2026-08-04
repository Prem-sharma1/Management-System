import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      select: { clientId: true, clientName: true, businessName: true, email: true }
    });
    
    const users = await prisma.user.findMany({
      select: { name: true, role: true, email: true }
    });

    return NextResponse.json({
      success: true,
      clients,
      staff: users
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
