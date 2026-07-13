import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'dev.db');
    
    // Remove if it exists to start fresh
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    const db = new Database(dbPath);
    
    // 1. Create tables
    db.exec(`
      CREATE TABLE User (
        id INTEGER PRIMARY KEY, email TEXT, name TEXT, password TEXT, role TEXT, department TEXT, salary REAL, status TEXT, avatar TEXT, createdAt TEXT
      );
      CREATE TABLE Attendance (
        id INTEGER PRIMARY KEY, userId INTEGER, clockIn TEXT, clockOut TEXT, status TEXT, date TEXT, createdAt TEXT
      );
      CREATE TABLE LeaveRequest (
        id INTEGER PRIMARY KEY, userId INTEGER, startDate TEXT, endDate TEXT, reason TEXT, status TEXT, createdAt TEXT
      );
      CREATE TABLE Task (
        id INTEGER PRIMARY KEY, title TEXT, description TEXT, status TEXT, assignedToId INTEGER, createdById INTEGER, dueDate TEXT, createdAt TEXT
      );
      CREATE TABLE AuditLog (
        id INTEGER PRIMARY KEY, action TEXT, performedByName TEXT, performedByRole TEXT, createdAt TEXT
      );
      CREATE TABLE Client (
        id INTEGER PRIMARY KEY, clientId TEXT, businessName TEXT, clientName TEXT, joiningDate TEXT, services TEXT, packageName TEXT, packageAmount REAL, contact TEXT, email TEXT, website TEXT, sector TEXT, requirement TEXT, accountReady INTEGER, active INTEGER, notes TEXT, createdAt TEXT
      );
      CREATE TABLE ClientTask (
        id INTEGER PRIMARY KEY, taskId TEXT, clientId TEXT, businessName TEXT, taskTitle TEXT, date TEXT, assignTo TEXT, workingOn TEXT, status TEXT, service TEXT, packageName TEXT, postType TEXT, notes TEXT, createdAt TEXT
      );
      CREATE TABLE ClientDelivery (
        id INTEGER PRIMARY KEY, deliveryId TEXT, clientId TEXT, clientName TEXT, postType TEXT, postDate TEXT, status TEXT, linkedTaskId TEXT, workingOn TEXT, notes TEXT, createdAt TEXT
      );
      CREATE TABLE Plan (
        id INTEGER PRIMARY KEY, category TEXT, name TEXT, price REAL, billingCycle TEXT, features TEXT, createdAt TEXT
      );
    `);

    // 2. Fetch and insert data
    const users = await prisma.user.findMany();
    const insertUser = db.prepare('INSERT INTO User VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const row of users) insertUser.run(row.id, row.email, row.name, row.password, row.role, row.department, row.salary, row.status, row.avatar, row.createdAt.toISOString());

    const attendances = await prisma.attendance.findMany();
    const insertAtt = db.prepare('INSERT INTO Attendance VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const row of attendances) insertAtt.run(row.id, row.userId, row.clockIn.toISOString(), row.clockOut ? row.clockOut.toISOString() : null, row.status, row.date, row.createdAt.toISOString());

    const leaveRequests = await prisma.leaveRequest.findMany();
    const insertLeave = db.prepare('INSERT INTO LeaveRequest VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const row of leaveRequests) insertLeave.run(row.id, row.userId, row.startDate, row.endDate, row.reason, row.status, row.createdAt.toISOString());

    const tasks = await prisma.task.findMany();
    const insertTask = db.prepare('INSERT INTO Task VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const row of tasks) insertTask.run(row.id, row.title, row.description, row.status, row.assignedToId, row.createdById, row.dueDate, row.createdAt.toISOString());

    const auditLogs = await prisma.auditLog.findMany();
    const insertAudit = db.prepare('INSERT INTO AuditLog VALUES (?, ?, ?, ?, ?)');
    for (const row of auditLogs) insertAudit.run(row.id, row.action, row.performedByName, row.performedByRole, row.createdAt.toISOString());

    const clients = await prisma.client.findMany();
    const insertClient = db.prepare('INSERT INTO Client VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const row of clients) insertClient.run(row.id, row.clientId, row.businessName, row.clientName, row.joiningDate, row.services, row.packageName, row.packageAmount, row.contact, row.email, row.website, row.sector, row.requirement, row.accountReady ? 1 : 0, row.active ? 1 : 0, row.notes, row.createdAt.toISOString());

    const clientTasks = await prisma.clientTask.findMany();
    const insertClientTask = db.prepare('INSERT INTO ClientTask VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const row of clientTasks) insertClientTask.run(row.id, row.taskId, row.clientId, row.businessName, row.taskTitle, row.date, row.assignTo, row.workingOn, row.status, row.service, row.packageName, row.postType, row.notes, row.createdAt.toISOString());

    const clientDeliveries = await prisma.clientDelivery.findMany();
    const insertClientDel = db.prepare('INSERT INTO ClientDelivery VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const row of clientDeliveries) insertClientDel.run(row.id, row.deliveryId, row.clientId, row.clientName, row.postType, row.postDate, row.status, row.linkedTaskId, row.workingOn, row.notes, row.createdAt.toISOString());

    const plans = await prisma.plan.findMany();
    const insertPlan = db.prepare('INSERT INTO Plan VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const row of plans) insertPlan.run(row.id, row.category, row.name, row.price, row.billingCycle, JSON.stringify(row.features), row.createdAt.toISOString());

    db.close();

    return NextResponse.json({ message: 'Database fully exported to dev.db!' });
  } catch (error) {
    console.error('Export DB Error:', error);
    return NextResponse.json({ error: 'Failed to export', details: error.message }, { status: 500 });
  }
}
