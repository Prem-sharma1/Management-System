import { prisma } from '@/lib/db';
// Updated prune helper module

function parseDate(dateStr) {
  if (!dateStr) return null;
  
  const cleanStr = dateStr.trim();

  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
    return new Date(cleanStr.slice(0, 10));
  }
  
  // Try DD/MM/YYYY or DD-MM-YYYY or DD-MMM-YYYY
  const parts = cleanStr.split(/[\/\-]/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthPart = parts[1].toLowerCase().trim();
    const year = parseInt(parts[2], 10);

    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    let month = months[monthPart.slice(0, 3)];
    if (month === undefined && !isNaN(parseInt(monthPart, 10))) {
      month = parseInt(monthPart, 10) - 1; // 1-indexed to 0-indexed
    }

    if (month !== undefined && month >= 0 && month <= 11 && !isNaN(day) && !isNaN(year)) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  
  const d = new Date(cleanStr);
  return isNaN(d.getTime()) ? null : d;
}

const EXPLICIT_TASK_IDS = [
  'AID-0009-SM-APPROVAL-4', 'AID-0009-SM-DESIGN-4', 'AID-0008-SM-REELS-1',
  'AID-0006-WEEKLY-REPORT-4', 'AID-0007-SM-AI-VIDEOS-2', 'AID-0009-SM-POST-4',
  'AID-0007-WEEKLY-REPORT-3', 'AID-0012-ADS-AI-VIDEO', 'AID-0010-SM-POST-2',
  'AID-0009-SM-POST-3', 'AID-0007-SM-GRAPHIC-4', 'AID-0006-SM-GRAPHIC-6',
  'AID-0010-SM-APPROVAL-2', 'AID-0010-SM-DESIGN-2', 'AID-0009-SM-APPROVAL-3',
  'AID-0009-SM-DESIGN-3', 'AID-0008-WEEKLY-REPORT-1', 'AID-0008-SM-GRAPHIC-1',
  'AID-0012-LOGIN', 'AID-0011-ADS-RUN', 'AID-0011-CREATE-PAGE',
  'AID-0010-SM-POST-1', 'AID-0012-CREATE-ACCOUNTS'
];

export async function pruneBeforeJulyData() {
  try {
    const cutoffDate = new Date('2026-07-01T00:00:00Z');
    const results = {};

    // 1. ClientTask
    const allTasks = await prisma.clientTask.findMany({
      select: { id: true, taskId: true, date: true, createdAt: true }
    });
    const tasksToDelete = allTasks.filter(t => {
      if (t.taskId && EXPLICIT_TASK_IDS.includes(t.taskId)) return true;
      if (t.createdAt && new Date(t.createdAt) < cutoffDate) return true;
      if (t.date) {
        const d = parseDate(t.date);
        if (d && d < cutoffDate) return true;
        if (/\/(01|02|03|04|05|06)\/2026/.test(t.date) || /-(01|02|03|04|05|06)-2026/.test(t.date) || /-(Jan|Feb|Mar|Apr|May|Jun)-2026/i.test(t.date)) return true;
      }
      return false;
    });
    if (tasksToDelete.length > 0) {
      const res = await prisma.clientTask.deleteMany({
        where: { id: { in: tasksToDelete.map(t => t.id) } }
      });
      results.clientTasks = res.count;
    } else {
      results.clientTasks = 0;
    }

    // 2. ClientDelivery
    const allDeliveries = await prisma.clientDelivery.findMany({
      select: { id: true, postDate: true, createdAt: true }
    });
    const deliveriesToDelete = allDeliveries.filter(d => {
      if (d.createdAt && new Date(d.createdAt) < cutoffDate) return true;
      const dateVal = parseDate(d.postDate);
      return dateVal && dateVal < cutoffDate;
    });
    if (deliveriesToDelete.length > 0) {
      const res = await prisma.clientDelivery.deleteMany({
        where: { id: { in: deliveriesToDelete.map(d => d.id) } }
      });
      results.clientDeliveries = res.count;
    } else {
      results.clientDeliveries = 0;
    }

    // 3. Attendance
    const allAttendance = await prisma.attendance.findMany({
      select: { id: true, date: true, createdAt: true }
    });
    const attendanceToDelete = allAttendance.filter(a => {
      if (a.createdAt && new Date(a.createdAt) < cutoffDate) return true;
      const d = parseDate(a.date);
      return d && d < cutoffDate;
    });
    if (attendanceToDelete.length > 0) {
      const res = await prisma.attendance.deleteMany({
        where: { id: { in: attendanceToDelete.map(a => a.id) } }
      });
      results.attendance = res.count;
    } else {
      results.attendance = 0;
    }

    // 4. LeaveRequest
    const allLeaves = await prisma.leaveRequest.findMany({
      select: { id: true, startDate: true, createdAt: true }
    });
    const leavesToDelete = allLeaves.filter(l => {
      if (l.createdAt && new Date(l.createdAt) < cutoffDate) return true;
      const d = parseDate(l.startDate);
      return d && d < cutoffDate;
    });
    if (leavesToDelete.length > 0) {
      const res = await prisma.leaveRequest.deleteMany({
        where: { id: { in: leavesToDelete.map(l => l.id) } }
      });
      results.leaveRequests = res.count;
    } else {
      results.leaveRequests = 0;
    }

    // 5. Task (Internal User Task)
    const allInternalTasks = await prisma.task.findMany({
      select: { id: true, title: true, description: true, dueDate: true, createdAt: true }
    });

    const internalTasksToDelete = allInternalTasks.filter(t => {
      if (t.createdAt && new Date(t.createdAt) < cutoffDate) return true;
      if (t.dueDate) {
        const d = parseDate(t.dueDate);
        if (d && d < cutoffDate) return true;
        if (/\/(01|02|03|04|05|06)\/2026/.test(t.dueDate) || /-(01|02|03|04|05|06)-2026/.test(t.dueDate) || /-(Jan|Feb|Mar|Apr|May|Jun)-2026/i.test(t.dueDate)) return true;
      }
      if (t.description && EXPLICIT_TASK_IDS.some(id => t.description.includes(id))) return true;
      return false;
    });

    if (internalTasksToDelete.length > 0) {
      const res = await prisma.task.deleteMany({
        where: { id: { in: internalTasksToDelete.map(t => t.id) } }
      });
      results.internalTasks = res.count;
    } else {
      results.internalTasks = 0;
    }

    // 6. AuditLog
    const allAuditLogs = await prisma.auditLog.findMany({
      select: { id: true, createdAt: true }
    });
    const auditLogsToDelete = allAuditLogs.filter(a => {
      return a.createdAt && new Date(a.createdAt) < cutoffDate;
    });
    if (auditLogsToDelete.length > 0) {
      const res = await prisma.auditLog.deleteMany({
        where: { id: { in: auditLogsToDelete.map(a => a.id) } }
      });
      results.auditLogs = res.count;
    } else {
      results.auditLogs = 0;
    }

    // 7. ClientFeedback
    const allFeedback = await prisma.clientFeedback.findMany({
      select: { id: true, createdAt: true }
    });
    const feedbackToDelete = allFeedback.filter(f => {
      return f.createdAt && new Date(f.createdAt) < cutoffDate;
    });
    if (feedbackToDelete.length > 0) {
      const res = await prisma.clientFeedback.deleteMany({
        where: { id: { in: feedbackToDelete.map(f => f.id) } }
      });
      results.clientFeedbacks = res.count;
    } else {
      results.clientFeedbacks = 0;
    }

    // 8. Client
    const allClients = await prisma.client.findMany({
      select: { id: true, clientId: true, businessName: true, joiningDate: true, createdAt: true }
    });
    const clientsToDelete = allClients.filter(c => {
      if (c.createdAt && new Date(c.createdAt) < cutoffDate) return true;
      const d = parseDate(c.joiningDate);
      return d && d < cutoffDate;
    });
    if (clientsToDelete.length > 0) {
      const clientIds = clientsToDelete.map(c => c.clientId);
      const dbIds = clientsToDelete.map(c => c.id);

      await prisma.user.deleteMany({
        where: {
          role: 'CLIENT',
          department: { in: clientIds }
        }
      });

      const res = await prisma.client.deleteMany({
        where: { id: { in: dbIds } }
      });
      results.clients = res.count;
    } else {
      results.clients = 0;
    }

    return results;
  } catch (error) {
    console.error('pruneBeforeJulyData error:', error);
    throw error;
  }
}

export async function rebalanceAiVideoTasks() {
  try {
    const teamNames = ['Masoom', 'Nouman', 'Divyansh'];
    const activeEditors = await prisma.user.findMany({
      where: { name: { in: teamNames } }
    });

    const editorMap = {};
    teamNames.forEach(name => {
      const found = activeEditors.find(e => e.name.toLowerCase() === name.toLowerCase());
      if (found) editorMap[name] = found.name;
    });

    const teamList = teamNames.map(name => editorMap[name] || name);

    // 1. Fetch ONLY actual AI Video Creation/Editing tasks.
    // EXCLUDE Script tasks (assigned to Harshit) and Posting tasks (assigned to designated poster)
    const aiTasks = await prisma.clientTask.findMany({
      where: {
        AND: [
          {
            OR: [
              { assignTo: { contains: 'Ai Video Editor', mode: 'insensitive' } },
              { postType: 'AI Video' }
            ]
          },
          { postType: { notIn: ['Script', 'Posting'] } },
          { taskTitle: { not: { contains: 'Script', mode: 'insensitive' } } },
          { taskTitle: { not: { startsWith: 'Post', mode: 'insensitive' } } },
          { assignTo: { notIn: ['AI Video Lead', 'Content Posting'] } }
        ]
      }
    });

    for (const task of aiTasks) {
      const match = (task.clientId || '').match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 1;
      const assignedName = teamList[Math.abs(num - 1) % teamList.length];

      if (task.workingOn !== assignedName) {
        await prisma.clientTask.update({
          where: { id: task.id },
          data: { workingOn: assignedName }
        });
        task.workingOn = assignedName;
      }
    }

    // 2. Restore ALL Script tasks to Harshit (AI Video Lead)
    const scriptTasks = await prisma.clientTask.findMany({
      where: {
        OR: [
          { postType: 'Script' },
          { taskTitle: { contains: 'Script', mode: 'insensitive' } },
          { assignTo: 'AI Video Lead' }
        ]
      }
    });

    for (const st of scriptTasks) {
      if (st.workingOn !== 'Harshit' || st.assignTo !== 'AI Video Lead') {
        await prisma.clientTask.update({
          where: { id: st.id },
          data: { workingOn: 'Harshit', assignTo: 'AI Video Lead' }
        });
      }
    }

    // 3. Sync Posting tasks to match the client's other posting tasks if incorrectly assigned to an editor
    const postingTasks = await prisma.clientTask.findMany({
      where: {
        OR: [
          { postType: 'Posting' },
          { taskTitle: { startsWith: 'Post ', mode: 'insensitive' } },
          { assignTo: 'Content Posting' }
        ]
      }
    });

    // Group posting tasks by clientId
    const clientPostingMap = {};
    postingTasks.forEach(pt => {
      if (!clientPostingMap[pt.clientId]) clientPostingMap[pt.clientId] = [];
      clientPostingMap[pt.clientId].push(pt);
    });

    for (const [clientId, pTasks] of Object.entries(clientPostingMap)) {
      // Find poster assigned to non-AI-video posting tasks for this client (e.g. Divyansh)
      const validPoster = pTasks.find(pt => 
        pt.workingOn && 
        pt.workingOn !== 'AUTO' && 
        !pt.taskTitle.toLowerCase().includes('ai video')
      )?.workingOn || pTasks.find(pt => pt.workingOn && pt.workingOn !== 'AUTO')?.workingOn;

      if (validPoster) {
        for (const pt of pTasks) {
          if (pt.workingOn !== validPoster) {
            await prisma.clientTask.update({
              where: { id: pt.id },
              data: { workingOn: validPoster }
            });
          }
        }
      }
    }

    // 4. Fetch all AI Video ClientDeliveries (EXCLUDING scripts)
    const aiDeliveries = await prisma.clientDelivery.findMany({
      where: {
        postType: 'AI Video',
        deliverableName: { not: { contains: 'Script', mode: 'insensitive' } }
      }
    });

    for (const del of aiDeliveries) {
      const match = (del.clientId || '').match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 1;
      const assignedName = teamList[Math.abs(num - 1) % teamList.length];

      if (del.workingOn !== assignedName) {
        await prisma.clientDelivery.update({
          where: { id: del.id },
          data: { workingOn: assignedName }
        });
      }
    }
  } catch (err) {
    console.error('Error rebalancing AI Video tasks:', err);
  }
}

