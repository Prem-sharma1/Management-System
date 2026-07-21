import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const tasks = await prisma.clientTask.findMany({
      include: { Client: true }
    });

    // 1. Auto-approve tasks in 'Client Review' for > 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const pendingReviewTasks = tasks.filter(t => 
      t.status === 'Client Review' && 
      (t.statusChangedAt ? new Date(t.statusChangedAt) <= twentyFourHoursAgo : new Date(t.createdAt) <= twentyFourHoursAgo)
    );

    if (pendingReviewTasks.length > 0) {
      const taskIdsToApprove = pendingReviewTasks.map(t => t.id);
      await prisma.clientTask.updateMany({
        where: { id: { in: taskIdsToApprove } },
        data: {
          status: 'Completion',
          statusChangedAt: now
        }
      });
      tasks.forEach(t => {
        if (taskIdsToApprove.includes(t.id)) {
          t.status = 'Completion';
          t.statusChangedAt = now;
        }
      });
    }

    // 2. Auto-create missing posting tasks for content deliverables if they don't exist
    const contentTasks = tasks.filter(t => 
      ['Graphic', 'Reel', 'AI Video'].includes(t.postType) || 
      (t.taskTitle && (t.taskTitle.startsWith('Graphic') || t.taskTitle.startsWith('Reel') || t.taskTitle.startsWith('AI Video')))
    );

    for (const cTask of contentTasks) {
      const postingTitle = `Post ${cTask.taskTitle}`;
      const existingPostingTask = tasks.find(t => 
        t.clientId === cTask.clientId && 
        (t.taskTitle.toLowerCase() === postingTitle.toLowerCase() || t.taskTitle.toLowerCase() === `post ${cTask.taskTitle.toLowerCase()}`)
      );

      if (!existingPostingTask) {
        const uniqueSuffix = `${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTaskId = `${cTask.taskId}-POST-${uniqueSuffix}`;

        try {
          const createdPosting = await prisma.clientTask.create({
            data: {
              taskId: newTaskId,
              clientId: cTask.clientId,
              businessName: cTask.businessName || '',
              taskTitle: postingTitle,
              date: cTask.date,
              assignTo: 'Content Posting',
              workingOn: 'AUTO',
              status: 'Not Started',
              priority: cTask.priority || 'Normal',
              postType: 'Posting',
              notes: cTask.taskId
            }
          });
          tasks.push(createdPosting);
        } catch (err) {
          console.error(`Failed to auto-create missing posting task ${postingTitle}:`, err);
        }
      }
    }

    tasks.sort((a, b) => {
      const d1 = new Date(a.date).getTime() || 0;
      const d2 = new Date(b.date).getTime() || 0;
      return d1 - d2;
    });

    return NextResponse.json(
      { tasks },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Global client tasks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
