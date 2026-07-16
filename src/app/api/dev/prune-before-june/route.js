import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr.slice(0, 10));
  }
  
  // Try DD-MMM-YYYY (e.g., "25-Feb-2026")
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].toLowerCase().slice(0, 3);
    const year = parseInt(parts[2], 10);
    
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    
    const month = months[monthStr];
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  
  // Fallback to built-in Date constructor
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export async function GET() {
  try {
    const cutoffDate = new Date('2026-06-01T00:00:00Z');
    const results = {};

    // --- 1. ClientTask ---
    const allTasks = await prisma.clientTask.findMany({
      select: { id: true, date: true, createdAt: true }
    });
    const tasksToDelete = allTasks.filter(t => {
      if (t.createdAt && new Date(t.createdAt) < cutoffDate) return true;
      const d = parseDate(t.date);
      return d && d < cutoffDate;
    });
    if (tasksToDelete.length > 0) {
      const res = await prisma.clientTask.deleteMany({
        where: { id: { in: tasksToDelete.map(t => t.id) } }
      });
      results.clientTasks = res.count;
    } else {
      results.clientTasks = 0;
    }

    // --- 2. ClientDelivery ---
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

    // --- 3. Attendance ---
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

    // --- 4. LeaveRequest ---
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

    // --- 5. Task (Internal User Task) ---
    const allInternalTasks = await prisma.task.findMany({
      select: { id: true, createdAt: true }
    });
    const internalTasksToDelete = allInternalTasks.filter(t => {
      return t.createdAt && new Date(t.createdAt) < cutoffDate;
    });
    if (internalTasksToDelete.length > 0) {
      const res = await prisma.task.deleteMany({
        where: { id: { in: internalTasksToDelete.map(t => t.id) } }
      });
      results.internalTasks = res.count;
    } else {
      results.internalTasks = 0;
    }

    // --- 6. AuditLog ---
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

    // --- 7. ClientFeedback ---
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

    // --- 8. Client ---
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

      // Delete portal users
      await prisma.user.deleteMany({
        where: {
          role: 'CLIENT',
          department: { in: clientIds }
        }
      });

      // Delete client records (cascades to tasks, deliveries, feedbacks)
      const res = await prisma.client.deleteMany({
        where: { id: { in: dbIds } }
      });
      results.clients = res.count;
    } else {
      results.clients = 0;
    }

    return NextResponse.json({
      success: true,
      message: 'Pruned database records before June 2026 successfully!',
      results
    });
  } catch (error) {
    console.error('Pruning API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
