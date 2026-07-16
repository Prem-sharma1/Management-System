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
  const cutoffDate = new Date('2026-06-01T00:00:00Z');

  console.log(`=== DATABASE CHECK BEFORE JUNE 2026 ===`);
  console.log(`Cutoff Date: ${cutoffDate.toISOString()}`);
  console.log(`========================================\n`);

  // --- 1. ClientTask ---
  const allTasks = await prisma.clientTask.findMany({
    select: { id: true, date: true, createdAt: true }
  });
  const tasksToDelete = allTasks.filter(t => {
    if (t.createdAt && new Date(t.createdAt) < cutoffDate) return true;
    const d = parseDate(t.date);
    return d && d < cutoffDate;
  });
  console.log(`ClientTask:`);
  console.log(`  Total: ${allTasks.length}`);
  console.log(`  Before June: ${tasksToDelete.length}`);

  // --- 2. ClientDelivery ---
  const allDeliveries = await prisma.clientDelivery.findMany({
    select: { id: true, postDate: true, createdAt: true }
  });
  const deliveriesToDelete = allDeliveries.filter(d => {
    if (d.createdAt && new Date(d.createdAt) < cutoffDate) return true;
    const dateVal = parseDate(d.postDate);
    return dateVal && dateVal < cutoffDate;
  });
  console.log(`\nClientDelivery:`);
  console.log(`  Total: ${allDeliveries.length}`);
  console.log(`  Before June: ${deliveriesToDelete.length}`);

  // --- 3. Attendance ---
  const allAttendance = await prisma.attendance.findMany({
    select: { id: true, date: true, createdAt: true }
  });
  const attendanceToDelete = allAttendance.filter(a => {
    if (a.createdAt && new Date(a.createdAt) < cutoffDate) return true;
    const d = parseDate(a.date);
    return d && d < cutoffDate;
  });
  console.log(`\nAttendance:`);
  console.log(`  Total: ${allAttendance.length}`);
  console.log(`  Before June: ${attendanceToDelete.length}`);

  // --- 4. LeaveRequest ---
  const allLeaves = await prisma.leaveRequest.findMany({
    select: { id: true, startDate: true, createdAt: true }
  });
  const leavesToDelete = allLeaves.filter(l => {
    if (l.createdAt && new Date(l.createdAt) < cutoffDate) return true;
    const d = parseDate(l.startDate);
    return d && d < cutoffDate;
  });
  console.log(`\nLeaveRequest:`);
  console.log(`  Total: ${allLeaves.length}`);
  console.log(`  Before June: ${leavesToDelete.length}`);

  // --- 5. Task (Internal User Task) ---
  const allInternalTasks = await prisma.task.findMany({
    select: { id: true, createdAt: true }
  });
  const internalTasksToDelete = allInternalTasks.filter(t => {
    return t.createdAt && new Date(t.createdAt) < cutoffDate;
  });
  console.log(`\nTask (Internal):`);
  console.log(`  Total: ${allInternalTasks.length}`);
  console.log(`  Before June: ${internalTasksToDelete.length}`);

  // --- 6. AuditLog ---
  const allAuditLogs = await prisma.auditLog.findMany({
    select: { id: true, createdAt: true }
  });
  const auditLogsToDelete = allAuditLogs.filter(a => {
    return a.createdAt && new Date(a.createdAt) < cutoffDate;
  });
  console.log(`\nAuditLog:`);
  console.log(`  Total: ${allAuditLogs.length}`);
  console.log(`  Before June: ${auditLogsToDelete.length}`);

  // --- 7. ClientFeedback ---
  const allFeedback = await prisma.clientFeedback.findMany({
    select: { id: true, createdAt: true }
  });
  const feedbackToDelete = allFeedback.filter(f => {
    return f.createdAt && new Date(f.createdAt) < cutoffDate;
  });
  console.log(`\nClientFeedback:`);
  console.log(`  Total: ${allFeedback.length}`);
  console.log(`  Before June: ${feedbackToDelete.length}`);

  // --- 8. Client ---
  const allClients = await prisma.client.findMany({
    select: { id: true, joiningDate: true, createdAt: true }
  });
  const clientsToDelete = allClients.filter(c => {
    if (c.createdAt && new Date(c.createdAt) < cutoffDate) return true;
    const d = parseDate(c.joiningDate);
    return d && d < cutoffDate;
  });
  console.log(`\nClient (Master records):`);
  console.log(`  Total: ${allClients.length}`);
  console.log(`  Before June: ${clientsToDelete.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
