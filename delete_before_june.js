require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

async function main() {
  const isDryRun = process.argv.includes('--execute') ? false : true;
  
  const cutoffDate = new Date('2026-06-01T00:00:00Z');

  console.log(`=== DATABASE PRUNING SCRIPT (BEFORE JUNE 2026) ===`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (No changes will be made)' : 'EXECUTE (Pruning database)'}`);
  console.log(`Cutoff Date: ${cutoffDate.toISOString()}`);
  console.log(`==================================================\n`);

  // --- 1. ClientTask ---
  const allTasks = await prisma.clientTask.findMany({
    select: { id: true, taskId: true, taskTitle: true, date: true, createdAt: true }
  });
  const tasksToDelete = allTasks.filter(t => {
    if (t.createdAt && new Date(t.createdAt) < cutoffDate) return true;
    const d = parseDate(t.date);
    return d && d < cutoffDate;
  });
  console.log(`ClientTask: Found ${tasksToDelete.length} records to delete (out of ${allTasks.length}).`);

  // --- 2. ClientDelivery ---
  const allDeliveries = await prisma.clientDelivery.findMany({
    select: { id: true, deliveryId: true, postType: true, postDate: true, createdAt: true }
  });
  const deliveriesToDelete = allDeliveries.filter(d => {
    if (d.createdAt && new Date(d.createdAt) < cutoffDate) return true;
    const dateVal = parseDate(d.postDate);
    return dateVal && dateVal < cutoffDate;
  });
  console.log(`ClientDelivery: Found ${deliveriesToDelete.length} records to delete (out of ${allDeliveries.length}).`);

  // --- 3. Attendance ---
  const allAttendance = await prisma.attendance.findMany({
    select: { id: true, date: true, createdAt: true }
  });
  const attendanceToDelete = allAttendance.filter(a => {
    if (a.createdAt && new Date(a.createdAt) < cutoffDate) return true;
    const d = parseDate(a.date);
    return d && d < cutoffDate;
  });
  console.log(`Attendance: Found ${attendanceToDelete.length} records to delete (out of ${allAttendance.length}).`);

  // --- 4. LeaveRequest ---
  const allLeaves = await prisma.leaveRequest.findMany({
    select: { id: true, startDate: true, createdAt: true }
  });
  const leavesToDelete = allLeaves.filter(l => {
    if (l.createdAt && new Date(l.createdAt) < cutoffDate) return true;
    const d = parseDate(l.startDate);
    return d && d < cutoffDate;
  });
  console.log(`LeaveRequest: Found ${leavesToDelete.length} records to delete (out of ${allLeaves.length}).`);

  // --- 5. Task (Internal User Task) ---
  const allInternalTasks = await prisma.task.findMany({
    select: { id: true, title: true, createdAt: true }
  });
  const internalTasksToDelete = allInternalTasks.filter(t => {
    return t.createdAt && new Date(t.createdAt) < cutoffDate;
  });
  console.log(`Task (Internal): Found ${internalTasksToDelete.length} records to delete (out of ${allInternalTasks.length}).`);

  // --- 6. AuditLog ---
  const allAuditLogs = await prisma.auditLog.findMany({
    select: { id: true, action: true, createdAt: true }
  });
  const auditLogsToDelete = allAuditLogs.filter(a => {
    return a.createdAt && new Date(a.createdAt) < cutoffDate;
  });
  console.log(`AuditLog: Found ${auditLogsToDelete.length} records to delete (out of ${allAuditLogs.length}).`);

  // --- 7. ClientFeedback ---
  const allFeedback = await prisma.clientFeedback.findMany({
    select: { id: true, message: true, createdAt: true }
  });
  const feedbackToDelete = allFeedback.filter(f => {
    return f.createdAt && new Date(f.createdAt) < cutoffDate;
  });
  console.log(`ClientFeedback: Found ${feedbackToDelete.length} records to delete (out of ${allFeedback.length}).`);

  // --- 8. Client (Master records - Not deleted by default) ---
  const allClients = await prisma.client.findMany({
    select: { id: true, clientId: true, businessName: true, joiningDate: true, createdAt: true }
  });
  const clientsToDelete = allClients.filter(c => {
    if (c.createdAt && new Date(c.createdAt) < cutoffDate) return true;
    const d = parseDate(c.joiningDate);
    return d && d < cutoffDate;
  });
  console.log(`Client (Master records): Found ${clientsToDelete.length} clients registered before June (out of ${allClients.length}).`);

  if (isDryRun) {
    console.log(`\nDry run completed. To execute the deletion of operational data (Tasks, Deliveries, Attendance, Leave, Internal Tasks, Audits, Feedbacks), run:`);
    console.log(`  node delete_before_june.js --execute`);
    console.log(`\nNote: By default, this script WILL NOT delete Client master records. If you also want to delete Client master records, edit the script or run it manually.`);
  } else {
    console.log(`\nExecuting deletion...`);

    // Perform deletions
    if (tasksToDelete.length > 0) {
      const res = await prisma.clientTask.deleteMany({
        where: { id: { in: tasksToDelete.map(t => t.id) } }
      });
      console.log(`Deleted ${res.count} ClientTasks.`);
    }

    if (deliveriesToDelete.length > 0) {
      const res = await prisma.clientDelivery.deleteMany({
        where: { id: { in: deliveriesToDelete.map(d => d.id) } }
      });
      console.log(`Deleted ${res.count} ClientDeliveries.`);
    }

    if (attendanceToDelete.length > 0) {
      const res = await prisma.attendance.deleteMany({
        where: { id: { in: attendanceToDelete.map(a => a.id) } }
      });
      console.log(`Deleted ${res.count} Attendance records.`);
    }

    if (leavesToDelete.length > 0) {
      const res = await prisma.leaveRequest.deleteMany({
        where: { id: { in: leavesToDelete.map(l => l.id) } }
      });
      console.log(`Deleted ${res.count} LeaveRequests.`);
    }

    if (internalTasksToDelete.length > 0) {
      const res = await prisma.task.deleteMany({
        where: { id: { in: internalTasksToDelete.map(t => t.id) } }
      });
      console.log(`Deleted ${res.count} Internal Tasks.`);
    }

    if (auditLogsToDelete.length > 0) {
      const res = await prisma.auditLog.deleteMany({
        where: { id: { in: auditLogsToDelete.map(a => a.id) } }
      });
      console.log(`Deleted ${res.count} AuditLogs.`);
    }

    if (feedbackToDelete.length > 0) {
      const res = await prisma.clientFeedback.deleteMany({
        where: { id: { in: feedbackToDelete.map(f => f.id) } }
      });
      console.log(`Deleted ${res.count} ClientFeedbacks.`);
    }

    console.log(`\nPruning completed successfully!`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
