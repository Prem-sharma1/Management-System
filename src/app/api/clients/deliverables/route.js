import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const { clientId, businessName, tasks } = await request.json();

    if (!clientId || !tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // tasks should be an array of objects:
    // { taskTitle, assignTo, workingOn }

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

    const createdTasks = [];

    // We use a loop instead of createMany to easily generate sequential task IDs
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const taskId = `AID-T-${randomSuffix}-${i}`;

      const created = await prisma.clientTask.create({
        data: {
          taskId: taskId,
          clientId: clientId,
          businessName: businessName,
          taskTitle: task.taskTitle,
          date: task.date || dateStr,
          assignTo: task.assignTo,
          workingOn: task.workingOn,
          status: 'Not Started',
          priority: 'Normal',
          postType: task.postType || ''
        }
      });
      createdTasks.push(created);
    }

    return NextResponse.json({ success: true, count: createdTasks.length }, { status: 201 });

  } catch (error) {
    console.error('Error generating deliverables:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
