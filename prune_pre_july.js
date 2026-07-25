require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

async function main() {
  const cutoffDate = new Date('2026-07-01T00:00:00Z');
  console.log('=== STARTING PRUNE BEFORE JULY 1, 2026 ===');
  console.log('Cutoff Date:', cutoffDate.toISOString());

  const results = {};

  // 1. ClientTask
  const allClientTasks = await prisma.clientTask.findMany({
    select: { id: true, taskId: true, date: true, createdAt: true }
  });
  const clientTasksToDelete = allClientTasks.filter(t => {
    if (t.taskId && EXPLICIT_TASK_IDS.includes(t.taskId)) return true;
    if (t.createdAt && new Date(t.createdAt) < cutoffDate) return true;
    if (t.date) {
      const d = parseDate(t.date);
      if (d && d < cutoffDate) return true;
      if (/\/(01|02|03|04|05|06)\/2026/.test(t.date) || /-(01|02|03|04|05|06)-2026/.test(t.date) || /-(Jan|Feb|Mar|Apr|May|Jun)-2026/i.test(t.date)) return true;
    }
    return false;
  });
  if (clientTasksToDelete.length > 0) {
    const ids = clientTasksToDelete.map(t => t.id);
    const res = await prisma.clientTask.deleteMany({ where: { id: { in: ids } } });
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
    const ids = deliveriesToDelete.map(d => d.id);
    const res = await prisma.clientDelivery.deleteMany({ where: { id: { in: ids } } });
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
    const ids = attendanceToDelete.map(a => a.id);
    const res = await prisma.attendance.deleteMany({ where: { id: { in: ids } } });
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
    const ids = leavesToDelete.map(l => l.id);
    const res = await prisma.leaveRequest.deleteMany({ where: { id: { in: ids } } });
    results.leaveRequests = res.count;
  } else {
    results.leaveRequests = 0;
  }

  // 5. Internal Task
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
    const ids = internalTasksToDelete.map(t => t.id);
    const res = await prisma.task.deleteMany({ where: { id: { in: ids } } });
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
    const ids = auditLogsToDelete.map(a => a.id);
    const res = await prisma.auditLog.deleteMany({ where: { id: { in: ids } } });
    results.auditLogs = res.count;
  } else {
    results.auditLogs = 0;
  }

  // 7. ClientFeedback
  const allFeedbacks = await prisma.clientFeedback.findMany({
    select: { id: true, createdAt: true }
  });
  const feedbacksToDelete = allFeedbacks.filter(f => {
    return f.createdAt && new Date(f.createdAt) < cutoffDate;
  });
  if (feedbacksToDelete.length > 0) {
    const ids = feedbacksToDelete.map(f => f.id);
    const res = await prisma.clientFeedback.deleteMany({ where: { id: { in: ids } } });
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

    // Delete client portal users
    await prisma.user.deleteMany({
      where: {
        role: 'CLIENT',
        department: { in: clientIds }
      }
    });

    const res = await prisma.client.deleteMany({ where: { id: { in: dbIds } } });
    results.clients = res.count;
  } else {
    results.clients = 0;
  }

  console.log('Pruning Complete. Summary of deleted records:', results);
}

main()
  .catch(err => { console.error('Pruning error:', err); })
  .finally(() => prisma.$disconnect());
