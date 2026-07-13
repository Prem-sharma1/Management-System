import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const ct = await prisma.clientTask.findMany();
    
    // Let's migrate them to Task table
    const danish = await prisma.user.findFirst({ where: { name: 'Danish Khan' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!danish) return NextResponse.json({ error: 'No Danish found' });
    
    const adminId = admin ? admin.id : danish.id;
    let imported = 0;
    
    for (const task of ct) {
      if (task.workingOn && task.workingOn.includes('Danish')) {
        const existing = await prisma.task.findFirst({
          where: { title: task.taskTitle, assignedToId: danish.id }
        });
        if (!existing) {
          await prisma.task.create({
            data: {
              title: task.taskTitle,
              description: `Client: ${task.businessName} | Task ID: ${task.taskId} | Service: ${task.service}`,
              status: task.status === 'Complete Task' ? 'DONE' : 'TODO',
              assignedToId: danish.id,
              createdById: adminId,
              dueDate: task.date || "2026-05-01"
            }
          });
          imported++;
        }
      }
    }
    return NextResponse.json({ success: true, message: `POST: Imported ${imported} into Task model for Danish. Total CT: ${ct.length}` });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
