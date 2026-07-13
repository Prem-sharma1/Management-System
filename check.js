const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ct = await prisma.clientTask.findMany();
  console.log('Total client tasks:', ct.length);
  if (ct.length > 0) {
    console.log('Sample client tasks workingOn:', ct.slice(0, 5).map(c => c.workingOn));
    
    // Let's migrate them to Task table
    const danish = await prisma.user.findFirst({ where: { name: 'Danish Khan' } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!danish) { console.log('No Danish found'); return; }
    
    const adminId = admin ? admin.id : danish.id;
    let imported = 0;
    
    for (const task of ct) {
      if (task.workingOn && task.workingOn.includes('Danish')) {
        const existing = await prisma.task.findFirst({
          where: { title: task.taskTitle, assignedToId: danish.id }
        });
        if (!existing) {
          await prisma.task.create({
            data: {
              title: task.taskTitle,
              description: `Client: ${task.businessName} | Task ID: ${task.taskId} | Service: ${task.service}`,
              status: task.status === 'Complete Task' ? 'DONE' : 'TODO',
              assignedToId: danish.id,
              createdById: adminId,
              dueDate: task.date
            }
          });
          imported++;
        }
      }
    }
    console.log(`Imported ${imported} into Task model for Danish.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
