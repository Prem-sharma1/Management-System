import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const taskData = {
      taskId: 'AID-0053-SM-AI-VIDEOS-1',
      clientId: 'AID-0053',
      businessName: 'Aarya Consruction',
      taskTitle: 'SM AI Video 1 - Work on AI Video',
      date: '28/05/2026',
      assignTo: 'AI Video Editor',
      workingOn: 'Nouman',
      status: 'Not Started',
      service: 'Meta Ads',
      packageName: 'Standard(Meta Ads)',
      postType: 'AI Video',
      notes: ''
    };

    // Upsert to handle if it already exists or not
    const result = await prisma.clientTask.upsert({
      where: { taskId: taskData.taskId },
      update: taskData,
      create: taskData
    });

    return NextResponse.json({ success: true, result });
  } catch(e) {
    return NextResponse.json({ error: e.message });
  }
}
