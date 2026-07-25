import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import { pruneBeforeJulyData, rebalanceAiVideoTasks } from '@/lib/prune';
// Trigger HMR cache refresh

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Auto-prune all pre-July data across the database
    await pruneBeforeJulyData();

    // Auto-rebalance existing AI video tasks company-by-company across Masoom, Nouman, Divyansh
    await rebalanceAiVideoTasks();

    try {
      const fs = require('fs');
      const allClients = await prisma.client.findMany({ orderBy: { clientId: 'asc' } });
      const allClientTasks = await prisma.clientTask.findMany({ orderBy: { id: 'asc' } });
      const allDeliveries = await prisma.clientDelivery.findMany({ orderBy: { id: 'asc' } });

      const tasksByWorkingOn = {};
      allClientTasks.forEach(t => {
        const name = t.workingOn || 'UNASSIGNED';
        tasksByWorkingOn[name] = (tasksByWorkingOn[name] || 0) + 1;
      });

      const aiVideoEditors = ['Masoom', 'Nouman', 'Divyansh'];
      const aiVideoBreakdown = {};
      aiVideoEditors.forEach(name => {
        const tasksForEditor = allClientTasks.filter(t => t.workingOn && t.workingOn.toLowerCase() === name.toLowerCase());
        aiVideoBreakdown[name] = {
          count: tasksForEditor.length,
          clients: [...new Set(tasksForEditor.map(t => `${t.clientId} (${t.businessName})`))]
        };
      });

      const dump = {
        timestamp: new Date().toISOString(),
        summary: {
          totalClients: allClients.length,
          totalClientTasks: allClientTasks.length,
          totalClientDeliveries: allDeliveries.length,
          tasksByWorkingOn
        },
        aiVideoBreakdown,
        clients: allClients.map(c => ({
          clientId: c.clientId,
          businessName: c.businessName,
          joiningDate: c.joiningDate,
          packageName: c.packageName,
          packageAmount: c.packageAmount
        })),
        clientTasks: allClientTasks.map(t => ({
          taskId: t.taskId,
          clientId: t.clientId,
          businessName: t.businessName,
          taskTitle: t.taskTitle,
          date: t.date,
          assignTo: t.assignTo,
          workingOn: t.workingOn,
          status: t.status,
          postType: t.postType
        }))
      };

      fs.writeFileSync('d:\\AiDigitals_Projects\\Management-System\\july_data_dump.json', JSON.stringify(dump, null, 2));
    } catch (e) {
      console.error('Error dumping july data:', e);
    }

    // Purge any invalid 'Post ... Script ...' tasks from DB before fetching
    await prisma.clientTask.deleteMany({
      where: {
        OR: [
          { taskTitle: { contains: 'Script', mode: 'insensitive' }, postType: 'Posting' },
          { taskTitle: { startsWith: 'Post AI Video Script', mode: 'insensitive' } },
          { taskTitle: { startsWith: 'Post Script', mode: 'insensitive' } }
        ]
      }
    });

    const tasks = await prisma.clientTask.findMany({
      include: { Client: true }
    });

    // 2. Auto-approve tasks in 'Client Review' for > 24 hours
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

    // 3. Auto-create missing posting tasks ONLY for Graphic, Reel, and AI Video content (EXCLUDING Scripts)
    const contentTasks = tasks.filter(t => {
      const titleLower = (t.taskTitle || '').toLowerCase();
      const typeLower = (t.postType || '').toLowerCase();
      if (typeLower === 'script' || titleLower.includes('script')) return false;
      if (typeLower === 'posting' || titleLower.startsWith('post ')) return false;
      return ['graphic', 'reel', 'ai video'].includes(typeLower) || 
        titleLower.startsWith('graphic') || titleLower.startsWith('reel') || titleLower.startsWith('ai video');
    });

    for (const cTask of contentTasks) {
      const postingTitle = `Post ${cTask.taskTitle}`;
      const existingPostingTask = tasks.find(t => 
        t.clientId === cTask.clientId && 
        (t.taskTitle.toLowerCase() === postingTitle.toLowerCase() || t.taskTitle.toLowerCase() === `post ${cTask.taskTitle.toLowerCase()}`)
      );

      if (!existingPostingTask) {
        const existingPostingWithStaff = tasks.find(t => 
          t.clientId === cTask.clientId && 
          (t.postType === 'Posting' || (t.taskTitle && t.taskTitle.toLowerCase().startsWith('post '))) &&
          t.workingOn && t.workingOn !== 'AUTO'
        );
        const assignedPosterName = existingPostingWithStaff ? existingPostingWithStaff.workingOn : '';

        const uniqueSuffix = `${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTaskId = `${cTask.taskId}-POST-${uniqueSuffix}`;

        try {
          const createdPosting = await prisma.clientTask.create({
            data: {
              taskId: newTaskId,
              clientId: cTask.clientId,
              businessName: cTask.businessName || '',
              taskTitle: postingTitle,
              date: 'Trigger on Approval',
              assignTo: 'Content Posting',
              workingOn: assignedPosterName,
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
