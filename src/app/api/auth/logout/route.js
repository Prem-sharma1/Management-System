import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    
    if (userIdStr) {
      const userId = parseInt(userIdStr);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await prisma.auditLog.create({
          data: {
            action: `${user.name} logged out`,
            performedByName: user.name,
            performedByRole: user.role
          }
        });
      }
    }

    cookieStore.delete('userId');
    cookieStore.delete('clientId');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
