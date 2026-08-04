import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Find Rama, Pujan, Preet user records
    const rama = await prisma.user.findFirst({ where: { name: { contains: 'Rama', mode: 'insensitive' } } });
    const pujan = await prisma.user.findFirst({ where: { name: { contains: 'Pujan', mode: 'insensitive' } } });
    const preet = await prisma.user.findFirst({ where: { name: { contains: 'Preet', mode: 'insensitive' } } });
    const masoom = await prisma.user.findFirst({ where: { name: { contains: 'Masoom', mode: 'insensitive' } } });

    const smTeam = [
      { name: 'Rama', user: rama },
      { name: 'Pujan', user: pujan },
      { name: 'Preet', user: preet }
    ].filter(member => member.user !== null);

    if (smTeam.length === 0) {
      return NextResponse.json({ error: 'None of Rama, Pujan, or Preet found in database!' }, { status: 404 });
    }

    let updatedClientTasks = 0;
    let updatedClientDeliveries = 0;
    let updatedInternalTasks = 0;

    const accessKeywords = ['login', 'access', 'account', 'page', 'onboarding', 'report', 'ads'];

    // 2. Find and update ClientTask records assigned to Masoom for access/login/onboarding
    const masoomClientTasks = await prisma.clientTask.findMany({
      where: {
        workingOn: { contains: 'Masoom', mode: 'insensitive' }
      }
    });

    for (let i = 0; i < masoomClientTasks.length; i++) {
      const task = masoomClientTasks[i];
      const taskTitle = ((task.taskTitle || '') + ' ' + (task.postType || '')).toLowerCase();
      
      const isAccessTask = accessKeywords.some(kw => taskTitle.includes(kw));
      if (isAccessTask) {
        const assignedMember = smTeam[i % smTeam.length];
        await prisma.clientTask.update({
          where: { id: task.id },
          data: { workingOn: assignedMember.name }
        });
        updatedClientTasks++;

        // Also update matching internal Task if present
        if (task.taskCode && assignedMember.user) {
          const internalTask = await prisma.task.findFirst({
            where: { title: { contains: task.taskCode } }
          });
          if (internalTask) {
            await prisma.task.update({
              where: { id: internalTask.id },
              data: { assignedToId: assignedMember.user.id }
            });
            updatedInternalTasks++;
          }
        }
      }
    }

    // 3. Find and update ClientDelivery records assigned to Masoom for access/login/onboarding
    const masoomDeliveries = await prisma.clientDelivery.findMany({
      where: {
        workingOn: { contains: 'Masoom', mode: 'insensitive' }
      }
    });

    for (let i = 0; i < masoomDeliveries.length; i++) {
      const del = masoomDeliveries[i];
      const delType = ((del.postType || '') + ' ' + (del.clientName || '')).toLowerCase();
      
      if (accessKeywords.some(kw => delType.includes(kw)) || del.postType === 'Weekly Reports' || del.postType === 'Social Media Exec') {
        const assignedMember = smTeam[i % smTeam.length];
        await prisma.clientDelivery.update({
          where: { id: del.id },
          data: { workingOn: assignedMember.name }
        });
        updatedClientDeliveries++;
      }
    }

    // 4. Also find internal Task records assigned to Masoom's User ID where title contains login/access
    if (masoom) {
      const masoomTasks = await prisma.task.findMany({
        where: {
          assignedToId: masoom.id
        }
      });

      for (let i = 0; i < masoomTasks.length; i++) {
        const t = masoomTasks[i];
        const titleLower = (t.title || '').toLowerCase();
        if (accessKeywords.some(kw => titleLower.includes(kw))) {
          const assignedMember = smTeam[i % smTeam.length];
          await prisma.task.update({
            where: { id: t.id },
            data: { assignedToId: assignedMember.user.id }
          });
          updatedInternalTasks++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully reassigned all Client Login & Access Collection tasks from Masoom to Rama, Pujan, and Preet.',
      stats: {
        updatedClientTasks,
        updatedClientDeliveries,
        updatedInternalTasks,
        assignedTo: smTeam.map(m => m.name)
      }
    });
  } catch (error) {
    console.error('Error reassigning Masoom access tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
