import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const harshit = await prisma.user.findFirst({ where: { name: 'Harshit' } });
    if (!harshit) return NextResponse.json({ error: 'Harshit not found' });

    const masoom = await prisma.user.findFirst({ where: { name: 'Masoom' } });
    const nouman = await prisma.user.findFirst({ where: { name: 'Nouman' } });
    const divyansh = await prisma.user.findFirst({ where: { name: 'Divyansh' } });

    const assigns = [
      { user: masoom, title: "Ai Video Script - Top 10 Facts", desc: "https://docs.google.com/document/d/example1" },
      { user: nouman, title: "Reel Script - Travel Destinations", desc: "https://docs.google.com/document/d/example2" },
      { user: divyansh, title: "Product Promo Script", desc: "https://docs.google.com/document/d/example3" }
    ];

    let createdCount = 0;

    for (const assign of assigns) {
      if (assign.user) {
        await prisma.task.create({
          data: {
            title: assign.title,
            description: assign.desc,
            assignedToId: assign.user.id,
            createdById: harshit.id,
            status: 'TODO',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
          }
        });
        createdCount++;
      }
    }

    // Optionally create Audit logs
    await prisma.auditLog.create({
      data: {
        action: `Assigned scripts to ${createdCount} employees`,
        performedByName: harshit.name,
        performedByRole: harshit.role
      }
    });

    return NextResponse.json({ success: true, message: `Successfully assigned ${createdCount} scripts to Masoom, Nouman, and Divyansh on behalf of Harshit.` });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
