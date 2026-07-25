import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. All Clients
    const clients = await prisma.client.findMany({
      orderBy: { clientId: 'asc' }
    });

    // 2. All ClientTasks
    const allTasks = await prisma.clientTask.findMany({
      orderBy: { id: 'asc' }
    });

    // 3. All ClientDeliveries
    const allDeliveries = await prisma.clientDelivery.findMany({
      orderBy: { id: 'asc' }
    });

    // Task breakdown by workingOn
    const tasksByWorkingOn = {};
    allTasks.forEach(t => {
      const name = t.workingOn || 'UNASSIGNED';
      tasksByWorkingOn[name] = (tasksByWorkingOn[name] || 0) + 1;
    });

    // AI Video Tasks breakdown
    const aiVideoEditors = ['Masoom', 'Nouman', 'Divyansh'];
    const aiVideoTaskBreakdown = {};
    aiVideoEditors.forEach(name => {
      const tasksForEditor = allTasks.filter(t => t.workingOn && t.workingOn.toLowerCase() === name.toLowerCase());
      aiVideoTaskBreakdown[name] = {
        count: tasksForEditor.length,
        clients: [...new Set(tasksForEditor.map(t => `${t.clientId} (${t.businessName})`))]
      };
    });

    // Breakdown per client
    const tasksPerClient = {};
    allTasks.forEach(t => {
      const key = `${t.clientId} - ${t.businessName}`;
      if (!tasksPerClient[key]) {
        tasksPerClient[key] = [];
      }
      tasksPerClient[key].push({
        taskId: t.taskId,
        taskTitle: t.taskTitle,
        date: t.date,
        assignTo: t.assignTo,
        workingOn: t.workingOn,
        status: t.status
      });
    });

    return NextResponse.json({
      summary: {
        totalClients: clients.length,
        totalClientTasks: allTasks.length,
        totalClientDeliveries: allDeliveries.length,
        tasksByWorkingOn
      },
      aiVideoTaskBreakdown,
      clients: clients.map(c => ({
        clientId: c.clientId,
        businessName: c.businessName,
        joiningDate: c.joiningDate,
        packageName: c.packageName
      })),
      tasksPerClient
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
