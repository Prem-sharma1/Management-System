import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

const parseDbDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const monthName = parts[1];
    const year = parseInt(parts[2]);
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = months[monthName.toLowerCase()];
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateToDb = (date) => {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
};

const getMonthYearStr = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}`;
    }
  }
  return '';
};

// Parse counts from client requirement text (e.g. "Daily Activity: 5 Creatives, 3 Reels, 2 Ai Videos" or "Meta Ads, Creative - 5, AI Video - 2, Reels/Shorts - 3")
const parseRequirementCounts = (reqStr) => {
  let c = 5, r = 3, a = 2; // defaults
  if (!reqStr) return { c, r, a };
  
  const cMatch = reqStr.match(/Creative\s*-\s*(\d+)/i) || reqStr.match(/(\d+)\s*Creative/i);
  const rMatch = reqStr.match(/Reel[s\/Shorts]*\s*-\s*(\d+)/i) || reqStr.match(/(\d+)\s*Reel/i);
  const aMatch = reqStr.match(/AI\s*Video[s]?\s*-\s*(\d+)/i) || reqStr.match(/(\d+)\s*AI\s*Video/i);
  
  if (cMatch) c = parseInt(cMatch[1]);
  if (rMatch) r = parseInt(rMatch[1]);
  if (aMatch) a = parseInt(aMatch[1]);
  
  return { c, r, a };
};

export async function POST(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('userId')?.value;
    if (!userIdStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const requester = await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // 1. Calculate new cycle start date
    const today = new Date();
    const currentStart = parseDbDate(client.joiningDate);
    let newStart = new Date(today);

    if (currentStart) {
      const currentExpiry = new Date(currentStart);
      currentExpiry.setDate(currentExpiry.getDate() + 21);
      
      // If previous plan is still active, start new plan the day after expiry
      if (currentExpiry >= today) {
        newStart = new Date(currentExpiry);
        newStart.setDate(newStart.getDate() + 1);
      }
    }

    const newStartStr = formatDateToDb(newStart);

    // 1b. Clean up incomplete future tasks from the old cycle to avoid overlap
    const existingTasks = await prisma.clientTask.findMany({
      where: { clientId: client.clientId }
    });

    const tasksToDelete = existingTasks.filter(t => {
      const taskDate = parseDbDate(t.date);
      if (!taskDate) return false;
      if (t.status === 'Completed' || t.status === 'DONE' || t.status === 'Done') {
        return false;
      }
      return taskDate >= newStart;
    });

    if (tasksToDelete.length > 0) {
      await prisma.clientTask.deleteMany({
        where: {
          id: { in: tasksToDelete.map(t => t.id) }
        }
      });
    }

    // 2. Parse counts of creatives, reels, ai videos
    const { c: cCount, r: rCount, a: aCount } = parseRequirementCounts(client.requirement);

    // 3. Resolve active employees for round-robin assignment
    const activeEmployees = await prisma.user.findMany({
      where: {
        role: { in: ['EMPLOYEE', 'TL'] },
        status: 'ACTIVE'
      },
      orderBy: { id: 'asc' }
    });

    const rotationIndex = {};
    const createdTasks = [];

    const getFormattedDate = (offsetDays) => {
      const d = new Date(newStart);
      d.setDate(d.getDate() + offsetDays);
      return formatDateToDb(d);
    };

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"], v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Build the tasks list to generate (Excludes Onboarding Setup Tasks!)
    const tasksToCreate = [];

    const resolveStaff = (dept) => {
      // Find staff in this department
      const deptEmployees = activeEmployees.filter(e => {
        if (dept === 'Graphic Designer') {
          return ['swapnil', 'danish'].some(name => e.name.toLowerCase().includes(name.toLowerCase()));
        } else if (dept === 'Video Editor') {
          return ['sanmeet'].some(name => e.name.toLowerCase().includes(name.toLowerCase()));
        } else if (dept === 'AI Video Lead') {
          return ['harshit'].some(name => e.name.toLowerCase().includes(name.toLowerCase()));
        } else if (dept === 'Ai Video Editor') {
          return ['masoom', 'nouman', 'divyansh'].some(name => e.name.toLowerCase().includes(name.toLowerCase()));
        }
        return e.department === dept;
      });
      return deptEmployees.length > 0 ? deptEmployees : null;
    };

    const smStaffList = resolveStaff('Digital Marketing Executive');
    const smStaffName = smStaffList ? smStaffList[0].name : '';

    if (client.services === 'AI Video Plans') {
      const count = aCount || 5;
      for (let i = 1; i <= count; i++) {
        const base = 1 + (i - 1) * 4;
        tasksToCreate.push({
          taskTitle: `${getOrdinal(i)} AI Video Script`,
          assignTo: 'AI Video Lead',
          postType: 'Script',
          offset: base
        });
        tasksToCreate.push({
          taskTitle: `${getOrdinal(i)} AI Video`,
          assignTo: 'Ai Video Editor',
          postType: 'AI Video',
          offset: base + 1
        });
      }
    } else {
      // Standard plans: create SM Graphic, SM Reels, SM AI Videos, Weekly Reports
      // Excludes Setup/Onboarding tasks!
      const items = [];
      for (let i = 1; i <= cCount; i++) items.push({ title: `SM Graphic ${i}`, category: 'SM Graphic', num: i, assignTo: 'Graphic Designer', type: 'Graphic' });
      for (let i = 1; i <= rCount; i++) items.push({ title: `SM Reels ${i}`, category: 'SM Reels', num: i, assignTo: 'Video Editor', type: 'Reel' });
      for (let i = 1; i <= aCount; i++) items.push({ title: `${getOrdinal(i)} AI Video`, category: 'SM AI Videos', num: i, assignTo: 'Ai Video Editor', type: 'AI Video' });

      // Rotate/balance items distribution
      const pools = {
        'SM Graphic': items.filter(x => x.category === 'SM Graphic'),
        'SM Reels': items.filter(x => x.category === 'SM Reels'),
        'SM AI Videos': items.filter(x => x.category === 'SM AI Videos')
      };

      const balanced = [];
      while (pools['SM Graphic'].length || pools['SM Reels'].length || pools['SM AI Videos'].length) {
        ['SM Graphic', 'SM Reels', 'SM Graphic', 'SM AI Videos'].forEach(k => {
          if (pools[k].length) balanced.push(pools[k].shift());
        });
      }

      balanced.forEach((item, index) => {
        const offset = 0 + index * 1; // start from day 0 since no onboarding tasks
        if (item.type === 'AI Video') {
          tasksToCreate.push({
            taskTitle: `${getOrdinal(item.num)} AI Video Script`,
            assignTo: 'AI Video Lead',
            postType: 'Script',
            offset: offset
          });
          tasksToCreate.push({
            taskTitle: item.title,
            assignTo: item.assignTo,
            postType: item.type,
            offset: offset + 1
          });
        } else {
          tasksToCreate.push({
            taskTitle: item.title,
            assignTo: item.assignTo,
            postType: item.type,
            offset: offset
          });
        }
      });

      // Weekly Reports on days 7, 14, 21
      [7, 14, 21].forEach((offset, index) => {
        tasksToCreate.push({
          taskTitle: `Weekly Report ${index + 1}`,
          assignTo: 'Ads Campaign Manager',
          postType: 'Report',
          offset: offset
        });
      });
    }

    // Create and auto-assign tasks
    const employeeCounters = {};
    for (let i = 0; i < tasksToCreate.length; i++) {
      const task = tasksToCreate[i];
      let assignedEmployeeName = '';

      const dept = task.assignTo;
      const deptEmployees = resolveStaff(dept) || activeEmployees.filter(e => e.department === dept);

      if (deptEmployees && deptEmployees.length > 0) {
        const taskDate = getFormattedDate(task.offset);
        const monthYear = getMonthYearStr(taskDate);

        if (rotationIndex[dept] === undefined) {
          rotationIndex[dept] = 0;
        }

        let attempts = 0;
        let found = false;
        const candidateCounts = [];

        while (attempts < deptEmployees.length) {
          const emp = deptEmployees[rotationIndex[dept]];
          
          const count = await prisma.clientTask.count({
            where: {
              workingOn: emp.name,
              date: {
                endsWith: monthYear ? `-${monthYear}` : ''
              }
            }
          });

          candidateCounts.push({ emp, count });
          rotationIndex[dept] = (rotationIndex[dept] + 1) % deptEmployees.length;
          attempts++;

          if (count < 100) {
            assignedEmployeeName = emp.name;
            found = true;
            break;
          }
        }

        if (!found && candidateCounts.length > 0) {
          candidateCounts.sort((a, b) => a.count - b.count);
          assignedEmployeeName = candidateCounts[0].emp.name;
        }
      }

      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const taskId = `AID-T-${randomSuffix}-${i}`;

      let finalTitle = task.taskTitle;

      const created = await prisma.clientTask.create({
        data: {
          taskId: taskId,
          clientId: client.clientId,
          businessName: client.businessName,
          taskTitle: finalTitle,
          date: getFormattedDate(task.offset),
          assignTo: task.assignTo,
          workingOn: assignedEmployeeName,
          status: assignedEmployeeName ? 'Assigned' : 'Not Started',
          priority: 'Normal',
          postType: task.postType || ''
        }
      });
      createdTasks.push(created);
    }

    // 4. Update client's joining date
    await prisma.client.update({
      where: { id },
      data: { joiningDate: newStartStr }
    });

    // 5. Create Audit Log
    const newExpiry = new Date(newStart);
    newExpiry.setDate(newExpiry.getDate() + 21);
    const newExpiryStr = formatDateToDb(newExpiry);

    await prisma.auditLog.create({
      data: {
        action: `Renewed plan for client: ${client.businessName} (New cycle: ${newStartStr} to ${newExpiryStr})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ 
      success: true, 
      newJoiningDate: newStartStr,
      newExpiryDate: newExpiryStr,
      taskCount: createdTasks.length 
    });

  } catch (error) {
    console.error('Error renewing client plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
