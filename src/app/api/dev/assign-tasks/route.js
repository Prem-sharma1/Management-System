import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper to parse "DD-MMM-YYYY" (e.g. "30-Jan-2026" or "4-Feb-2026") into a Date
export function parseDateString(dateStr) {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(0);
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1].toLowerCase();
  const year = parseInt(parts[2], 10);

  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  const month = months[monthStr.substring(0, 3)] || 0;
  return new Date(year, month, day);
}

export async function assignTasksAndDeliveries() {
  // 1. Get all active employees and TLs
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['EMPLOYEE', 'TL'] },
      status: 'ACTIVE'
    }
  });

  // 2. Group employees by normalized department name
  const employeesByDept = {};
  for (const user of users) {
    const dept = (user.department || '').trim().toLowerCase();
    if (!employeesByDept[dept]) {
      employeesByDept[dept] = [];
    }
    employeesByDept[dept].push(user);
  }

  // Sort employees in each department by name/ID for deterministic rotation order
  for (const dept in employeesByDept) {
    employeesByDept[dept].sort((a, b) => a.id - b.id);
  }

  // Mappings of client task roles to normalized department keys
  const taskRoleToDeptKey = {
    'graphic designer': 'graphic designer',
    'ai video lead': 'ai video lead',
    'ai video editor': 'ai video editor',
    'video editor': 'video editor',
    'ads campaign manager': 'digital marketing executive',
    'social media executive': 'digital marketing executive'
  };

  // Mappings of delivery post types to normalized department keys
  const deliveryTypeToDeptKey = {
    'graphic': 'graphic designer',
    'reel': 'video editor',
    'ai video': 'ai video editor'
  };

  // 3. Process Client Tasks
  const allTasks = await prisma.clientTask.findMany();
  const tasksByDeptAndDate = {};

  for (const task of allTasks) {
    const roleKey = (task.assignTo || '').trim().toLowerCase();
    const deptKey = taskRoleToDeptKey[roleKey];
    if (!deptKey) continue;

    const dateStr = (task.date || '').trim();
    if (!dateStr) continue;

    if (!tasksByDeptAndDate[deptKey]) {
      tasksByDeptAndDate[deptKey] = {};
    }
    if (!tasksByDeptAndDate[deptKey][dateStr]) {
      tasksByDeptAndDate[deptKey][dateStr] = [];
    }
    tasksByDeptAndDate[deptKey][dateStr].push(task);
  }

  const updatedTasksCount = { count: 0 };

  for (const deptKey of Object.keys(tasksByDeptAndDate)) {
    const emps = employeesByDept[deptKey] || [];
    if (emps.length === 0) continue;

    if (deptKey === 'ai video editor') {
      const teamOrder = ['Masoom', 'Nouman', 'Divyansh'];
      const teamUsers = teamOrder
        .map(name => emps.find(e => e.name.toLowerCase().includes(name.toLowerCase())))
        .filter(Boolean);

      const uniqueDates = Object.keys(tasksByDeptAndDate[deptKey]);
      for (const dateStr of uniqueDates) {
        const tasks = tasksByDeptAndDate[deptKey][dateStr];
        for (const task of tasks) {
          let assignedName = emps[0].name;
          if (teamUsers.length > 0) {
            const match = (task.clientId || '').match(/\d+/);
            const num = match ? parseInt(match[0], 10) : 1;
            const idx = Math.abs(num - 1) % teamUsers.length;
            assignedName = teamUsers[idx].name;
          }
          await prisma.clientTask.update({
            where: { id: task.id },
            data: {
              workingOn: assignedName,
              status: task.status === 'Not Started' ? 'In Progress' : task.status
            }
          });
          updatedTasksCount.count++;
        }
      }
    } else {
      const uniqueDates = Object.keys(tasksByDeptAndDate[deptKey]);
      // Sort unique dates chronologically
      uniqueDates.sort((a, b) => parseDateString(a) - parseDateString(b));

      // For each unique date, pick a rotating employee and assign all tasks on that date
      for (let i = 0; i < uniqueDates.length; i++) {
        const dateStr = uniqueDates[i];
        const employee = emps[i % emps.length];
        const tasks = tasksByDeptAndDate[deptKey][dateStr];

        for (const task of tasks) {
          await prisma.clientTask.update({
            where: { id: task.id },
            data: {
              workingOn: employee.name,
              status: task.status === 'Not Started' ? 'In Progress' : task.status
            }
          });
          updatedTasksCount.count++;
        }
      }
    }
  }

  // 4. Process Client Deliveries
  const allDeliveries = await prisma.clientDelivery.findMany();
  const deliveriesByDeptAndDate = {};

  for (const del of allDeliveries) {
    const typeKey = (del.postType || '').trim().toLowerCase();
    const deptKey = deliveryTypeToDeptKey[typeKey];
    if (!deptKey) continue;

    const dateStr = (del.postDate || '').trim();
    if (!dateStr) continue;

    if (!deliveriesByDeptAndDate[deptKey]) {
      deliveriesByDeptAndDate[deptKey] = {};
    }
    if (!deliveriesByDeptAndDate[deptKey][dateStr]) {
      deliveriesByDeptAndDate[deptKey][dateStr] = [];
    }
    deliveriesByDeptAndDate[deptKey][dateStr].push(del);
  }

  const updatedDeliveriesCount = { count: 0 };

  for (const deptKey of Object.keys(deliveriesByDeptAndDate)) {
    const emps = employeesByDept[deptKey] || [];
    if (emps.length === 0) continue;

    const uniqueDates = Object.keys(deliveriesByDeptAndDate[deptKey]);
    uniqueDates.sort((a, b) => parseDateString(a) - parseDateString(b));

    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = uniqueDates[i];
      const employee = emps[i % emps.length];
      const deliveries = deliveriesByDeptAndDate[deptKey][dateStr];

      for (const del of deliveries) {
        await prisma.clientDelivery.update({
          where: { id: del.id },
          data: {
            workingOn: employee.name,
            status: del.status === 'Pending' ? 'In Progress' : del.status
          }
        });
        updatedDeliveriesCount.count++;
      }
    }
  }

  return {
    tasksCount: updatedTasksCount.count,
    deliveriesCount: updatedDeliveriesCount.count
  };
}

export async function GET() {
  try {
    const stats = await assignTasksAndDeliveries();
    return NextResponse.json({
      success: true,
      message: 'Successfully assigned and rotated employee tasks/deliveries according to dates.',
      stats
    });
  } catch (error) {
    console.error('Assign tasks error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to assign tasks',
      details: error.message
    }, { status: 500 });
  }
}
