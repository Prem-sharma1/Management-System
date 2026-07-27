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
        const dept = task.assignTo;
        const deptEmployees = activeEmployees.filter(e => {
          if (dept === 'Graphic Designer') {
            return ['swapnil', 'danish'].some(name => e.name.toLowerCase().includes(name.toLowerCase())) || e.department === dept;
          } else if (dept === 'Video Editor') {
            return ['sanmeet'].some(name => e.name.toLowerCase().includes(name.toLowerCase())) || e.department === dept;
          } else if (dept === 'AI Video Lead') {
            return ['harshit'].some(name => e.name.toLowerCase().includes(name.toLowerCase())) || e.department === dept;
          } else if (dept === 'Ai Video Editor' || dept === 'AI Video Editor') {
            return ['masoom', 'nouman', 'divyansh'].some(name => e.name.toLowerCase().includes(name.toLowerCase())) || e.department === dept;
          } else if (dept === 'Digital Marketing Executive' || dept === 'Social Media Executive') {
            return ['rama', 'pujan', 'preet'].some(name => e.name.toLowerCase().includes(name.toLowerCase())) || e.department === dept;
          }
          return e.department === dept;
        });

        if (dept === 'Ai Video Editor' || dept === 'AI Video Editor') {
          const teamOrder = ['Divyansh', 'Nouman', 'Masoom'];
          const teamUsers = teamOrder
            .map(name => activeEmployees.find(e => e.name.toLowerCase().includes(name.toLowerCase())))
            .filter(Boolean);

          if (teamUsers.length > 0) {
            const match = (clientId || '').match(/\d+/);
            const num = match ? parseInt(match[0], 10) : 1;
            const idx = Math.abs(num - 1) % teamUsers.length;
            assignedEmployeeName = teamUsers[idx].name;
          }
        } else if (deptEmployees.length > 0) {
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
