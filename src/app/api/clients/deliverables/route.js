import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const getMonthYearStr = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  
  // Format DD-MMM-YYYY (e.g., 21-Feb-2026)
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).replace(/ /g, '-');
        }
      }
      return `${parts[1]}-${parts[2]}`;
    }
  }
  
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).replace(/ /g, '-');
  }
  return '';
};

export async function POST(request) {
  try {
    const { clientId, businessName, tasks } = await request.json();

    if (!clientId || !tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify client exists before attaching task deliverables
    const clientRecord = await prisma.client.findUnique({
      where: { clientId }
    });

    if (!clientRecord) {
      return NextResponse.json({ error: `Client with ID "${clientId}" was not found in the database.` }, { status: 404 });
    }

    // Fetch all active employees
    const activeEmployees = await prisma.user.findMany({
      where: {
        role: { in: ['EMPLOYEE', 'TL'] },
        status: 'ACTIVE'
      },
      orderBy: {
        id: 'asc' // "First-in" approach based on ID creation
      }
    });

    // Rotation indices for departments
    const rotationIndex = {};

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    const createdTasks = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      let assignedEmployeeName = '';

      if (task.workingOn && task.workingOn !== 'AUTO') {
        assignedEmployeeName = task.workingOn;
      } else {
        // Auto assign logic
        const dept = task.assignTo; // E.g., "Graphic Designer"
        const deptEmployees = activeEmployees.filter(e => e.department === dept);

        if (deptEmployees.length > 0) {
          const taskDate = task.date || dateStr;
          const monthYear = getMonthYearStr(taskDate);

          if (rotationIndex[dept] === undefined) {
            rotationIndex[dept] = 0;
          }

          let attempts = 0;
          let found = false;
          const candidateCounts = [];

          while (attempts < deptEmployees.length) {
            const emp = deptEmployees[rotationIndex[dept]];
            
            // Count tasks in the specific month
            const count = await prisma.clientTask.count({
              where: {
                workingOn: emp.name,
                date: {
                  endsWith: monthYear ? `-${monthYear}` : ''
                }
              }
            });

            candidateCounts.push({ emp, count });

            // Increment rotation index
            rotationIndex[dept] = (rotationIndex[dept] + 1) % deptEmployees.length;
            attempts++;

            if (count < 100) {
              assignedEmployeeName = emp.name;
              found = true;
              break;
            }
          }

          // Fallback: if all candidate employees have >= 100 tasks, pick the one with the lowest count
          if (!found && candidateCounts.length > 0) {
            candidateCounts.sort((a, b) => a.count - b.count);
            assignedEmployeeName = candidateCounts[0].emp.name;
          }
        }
      }

      // Check if task already exists for this client on this date to prevent duplicates
      const existingTask = await prisma.clientTask.findFirst({
        where: {
          clientId: clientId,
          taskTitle: task.taskTitle,
          date: task.date || dateStr
        }
      });

      if (existingTask) {
        continue;
      }

      const uniqueSuffix = `${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const taskId = `AID-T-${uniqueSuffix}-${i}`;

      try {
        const created = await prisma.clientTask.create({
          data: {
            taskId: taskId,
            clientId: clientId,
            businessName: businessName || '',
            taskTitle: task.taskTitle || 'Deliverable Task',
            date: task.date || dateStr,
            assignTo: task.assignTo || '',
            workingOn: assignedEmployeeName || '',
            status: assignedEmployeeName ? 'Assigned' : 'Not Started',
            priority: 'Normal',
            postType: task.postType || ''
          }
        });
        createdTasks.push(created);
      } catch (insertErr) {
        console.error(`Failed to insert task ${taskId}:`, insertErr);
      }
    }

    return NextResponse.json({ success: true, count: createdTasks.length }, { status: 201 });

  } catch (error) {
    console.error('Error generating deliverables:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
