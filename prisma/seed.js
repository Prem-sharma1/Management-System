require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");
  
  // Clear tables in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.user.deleteMany({});
  
  // Create password hashes
  const salt = await bcrypt.genSalt(10);
  const ceoHash = await bcrypt.hash("AiDigitals@246", salt);
  const adminHash = await bcrypt.hash("Admin@#123", salt);
  const empHash = await bcrypt.hash("emp123", salt);
  
  // CEO
  const ceo = await prisma.user.create({
    data: {
      email: "nikhil@aidigital.com",
      name: "John Doe",
      password: ceoHash,
      role: "CEO",
      department: "Executive",
      salary: 250000,
      status: "ACTIVE",
      avatar: "👨‍💼"
    }
  });
  
  // Admin
  const admin = await prisma.user.create({
    data: {
      email: "praveen@aidigital.com",
      name: "Business Head",
      password: adminHash,
      role: "ADMIN",
      department: "HR",
      salary: 95000,
      status: "ACTIVE",
      avatar: "👨‍💼"
    }
  });
  
  // Employee
  const employee = await prisma.user.create({
    data: {
      email: "employee@workforce.com",
      name: "Bob Johnson",
      password: empHash,
      role: "EMPLOYEE",
      department: "Engineering",
      salary: 75000,
      status: "ACTIVE",
      avatar: "👨‍💻"
    }
  });
  
  console.log("Created core users:", { ceo: ceo.id, admin: admin.id, employee: employee.id });
  
  // Tasks
  await prisma.task.create({
    data: {
      title: "Quarterly Performance Review",
      description: "Perform evaluations for all engineering department members.",
      status: "TODO",
      assignedToId: admin.id,
      createdById: ceo.id,
      dueDate: "2026-07-15"
    }
  });
  
  await prisma.task.create({
    data: {
      title: "Build Login Panel Mockup",
      description: "Implement the login layout matching the designer's Figma sketch with CSS transitions.",
      status: "IN_PROGRESS",
      assignedToId: employee.id,
      createdById: admin.id,
      dueDate: "2026-07-10"
    }
  });
  
  await prisma.task.create({
    data: {
      title: "Initialize NextJS Workspace",
      description: "Set up Next.js app with Tailwind, SQLite database, and Prisma ORM configuration.",
      status: "DONE",
      assignedToId: employee.id,
      createdById: admin.id,
      dueDate: "2026-07-03"
    }
  });
  
  console.log("Created tasks.");

  // Attendance
  await prisma.attendance.create({
    data: {
      userId: employee.id,
      clockIn: new Date("2026-07-02T09:00:00Z"),
      clockOut: new Date("2026-07-02T17:00:00Z"),
      status: "PRESENT",
      date: "2026-07-02"
    }
  });
  
  console.log("Created attendance records.");

  // Leave Requests
  await prisma.leaveRequest.create({
    data: {
      userId: employee.id,
      startDate: "2026-07-20",
      endDate: "2026-07-22",
      reason: "Summer family trip",
      status: "PENDING"
    }
  });
  
  await prisma.leaveRequest.create({
    data: {
      userId: employee.id,
      startDate: "2026-06-10",
      endDate: "2026-06-11",
      reason: "Dental checkup",
      status: "APPROVED"
    }
  });
  
  console.log("Created leave requests.");

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      action: "Database initialized with core entities",
      performedByName: ceo.name,
      performedByRole: ceo.role
    }
  });
  
  await prisma.auditLog.create({
    data: {
      action: "Seeded initial workforce users and schedules",
      performedByName: admin.name,
      performedByRole: admin.role
    }
  });
  
  console.log("Created audit logs.");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
