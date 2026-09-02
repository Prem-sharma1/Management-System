import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('No DATABASE_URL found in environment');
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== ASSIGNING HARSHIT GAJBHIYE TASKS FOR CLIENTS (INCLUDING SANSKRUTI PRE SCHOOL) ===');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Harshit@Ai456', salt);

  // 1. Ensure Harshit user exists as EMPLOYEE
  let harshit = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'harshit@aidigital.com' },
        { name: { contains: 'Harshit', mode: 'insensitive' } }
      ]
    }
  });

  if (!harshit) {
    harshit = await prisma.user.create({
      data: {
        name: 'Harshit Gajbhiye',
        email: 'harshit@aidigital.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
        department: 'Social Media Marketing',
        salary: 30000,
        status: 'ACTIVE',
        avatar: '👤'
      }
    });
  } else {
    harshit = await prisma.user.update({
      where: { id: harshit.id },
      data: {
        name: 'Harshit Gajbhiye',
        email: 'harshit@aidigital.com',
        role: 'EMPLOYEE',
        department: 'Social Media Marketing',
        status: 'ACTIVE'
      }
    });
  }

  console.log(`User active: ${harshit.name} (ID: ${harshit.id})`);

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const adminId = admin ? admin.id : harshit.id;

  const rawData = `AID-0007-SM-GRAPHIC-1	AID-0007	Shree Renuka Opticals	SM Graphic 1	05/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0007-WEEKLY-REPORT-1	AID-0007	Shree Renuka Opticals	Weekly Report 1	05/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0006-SM-REELS-2	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM Reels 2	07/03/2026	Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Reel															
AID-0007-SM-REELS-1	AID-0007	Shree Renuka Opticals	SM Reels 1	07/03/2026	Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Reel															
AID-0006-SM-GRAPHIC-4	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM Graphic 4	09/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0007-SM-GRAPHIC-2	AID-0007	Shree Renuka Opticals	SM Graphic 2	09/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0008-LOGIN	AID-0008	Vidhivihan Agro Product	Client Login / Access Collection	11/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Basic(Meta Ads)																
AID-0006-WEEKLY-REPORT-3	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	Weekly Report 3	11/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0008-CREATE-ACCOUNTS	AID-0008	Vidhivihan Agro Product	Create Accounts	12/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Basic(Meta Ads)																
AID-0008-ADS-GRAPHIC	AID-0008	Vidhivihan Agro Product	Ads Graphic	12/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Basic(Meta Ads)	Graphic															
AID-0009-SM-CALENDAR-ANALYSIS	AID-0009	Prash Ayurveda	Analyse client business and make content calendar	12/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 10																
AID-0009-SM-CALENDAR-APPROVAL	AID-0009	Prash Ayurveda	Share calendar to client and get approval/changes	12/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 10																
AID-0006-SM-AI-VIDEOS-2	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM AI Video 2 - Work on AI Video	12/03/2026	AI Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	AI Video															
AID-0007-SM-AI-VIDEOS-1	AID-0007	Shree Renuka Opticals	SM AI Video 1 - Work on AI Video	12/03/2026	AI Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	AI Video															
AID-0007-WEEKLY-REPORT-2	AID-0007	Shree Renuka Opticals	Weekly Report 2	12/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0008-ADS-AI-VIDEO	AID-0008	Vidhivihan Agro Product	Work on 1st Ads AI Video	13/03/2026	AI Video Editor	Harshit	Not Started	Meta Ads	Basic(Meta Ads)	AI Video															
AID-0008-CREATE-PAGE	AID-0008	Vidhivihan Agro Product	Create Page	13/03/2026	Social Media Executive	Harshit	Not Started	Meta Ads	Basic(Meta Ads)																
AID-0008-ADS-RUN	AID-0008	Vidhivihan Agro Product	Ads Run	13/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Basic(Meta Ads)																
AID-0009-SM-DESIGN-1	AID-0009	Prash Ayurveda	According to Calendar make 1st Graphic design	13/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0009-SM-APPROVAL-1	AID-0009	Prash Ayurveda	Share 1st Graphic design with client and get approval	13/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0006-SM-GRAPHIC-5	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM Graphic 5	13/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0007-SM-GRAPHIC-3	AID-0007	Shree Renuka Opticals	SM Graphic 3	13/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0009-SM-POST-1	AID-0009	Prash Ayurveda	Posting 1st Graphic on Social Media Platforms	14/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0010-SM-CALENDAR-ANALYSIS	AID-0010	Socio-Political	Analyse client business and make content calendar	14/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 20																
AID-0010-SM-CALENDAR-APPROVAL	AID-0010	Socio-Political	Share calendar to client and get approval/changes	14/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 20																
AID-0011-LOGIN	AID-0011	Sanskruti Pre School	Client Login / Access Collection	14/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0009-SM-DESIGN-2	AID-0009	Prash Ayurveda	According to Calendar make 2nd Graphic design	15/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0009-SM-APPROVAL-2	AID-0009	Prash Ayurveda	Share 2nd Graphic design with client and get approval	15/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0010-SM-DESIGN-1	AID-0010	Socio-Political	According to Calendar make 1st Graphic design	15/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 20	Graphic															
AID-0010-SM-APPROVAL-1	AID-0010	Socio-Political	Share 1st Graphic design with client and get approval	15/03/2026	Graphic Designer	Harshit	Not Started	Social media Posts	Social media post 20	Graphic															
AID-0011-CREATE-ACCOUNTS	AID-0011	Sanskruti Pre School	Create Accounts	15/03/2026	Ads Campaign Manager	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)																
AID-0011-ADS-GRAPHIC	AID-0011	Sanskruti Pre School	Ads Graphic	15/03/2026	Graphic Designer	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Graphic															
AID-0006-SM-REELS-3	AID-0006	TravMore Exploring Made Easy(Sachin Parde)	SM Reels 3	15/03/2026	Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Reel															
AID-0007-SM-REELS-2	AID-0007	Shree Renuka Opticals	SM Reels 2	15/03/2026	Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	Reel															
AID-0009-SM-POST-2	AID-0009	Prash Ayurveda	Posting 2nd Graphic on Social Media Platforms	16/03/2026	Social Media Executive	Harshit	Not Started	Social media Posts	Social media post 10	Graphic															
AID-0011-ADS-AI-VIDEO	AID-0011	Sanskruti Pre School	Work on 1st Ads AI Video	16/03/2026	AI Video Editor	Harshit	Not Started	Meta Ads	Standard Old(Meta Ads)	AI Video															
AID-0053-ADS-AI-SCRIPT-1	AID-0053	Aarya Consruction	Prepare 1st Ads AI Video Script	16/05/2026	AI Video Lead	Harshit	Not Started	Meta Ads	Standard(Meta Ads)																
AID-0053-SM-AI-SCRIPT-1	AID-0053	Aarya Consruction	Prepare 1st SM AI Video Script	27/05/2026	AI Video Lead	Harshit	Not Started	Meta Ads	Standard(Meta Ads)																
AID-0079-AI-SCRIPT-1	AID-0079	Sharda Orthopedic	Prepare 1st AI Video Script	03/06/2026	AI Video Lead	Harshit	Complete Task	AI Videos	AI Videos 5`;

  const lines = rawData.split('\n').filter(l => l.trim().length > 0);

  let assignedCount = 0;
  for (const line of lines) {
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 10) continue;

    const [
      taskId, rawClientId, businessName, taskTitle,
      date, assignTo, workingOnRaw, status, service, packageRaw
    ] = parts;

    const postType = parts.length > 10 ? parts[10] : '';
    const notes = parts.length > 11 ? parts[11] : '';

    // Exclude Script tasks and AI Video Lead tasks
    if (postType === 'Script' || (taskTitle && taskTitle.toLowerCase().includes('script')) || assignTo === 'AI Video Lead') {
      continue;
    }

    // Match client in DB by businessName or clientId
    let dbClient = await prisma.client.findFirst({
      where: {
        OR: [
          { clientId: rawClientId },
          { businessName: { contains: businessName, mode: 'insensitive' } }
        ]
      }
    });

    const targetClientId = dbClient ? dbClient.clientId : rawClientId;

    if (!dbClient) {
      dbClient = await prisma.client.create({
        data: {
          clientId: targetClientId,
          businessName,
          clientName: businessName,
          email: `${targetClientId.toLowerCase()}@client.com`,
          contact: '0000000000',
          active: true,
          joiningDate: '01/01/2026',
          services: 'Various',
          packageName: 'Standard',
          packageAmount: 1000
        }
      });
    }

    // Upsert into ClientTask
    await prisma.clientTask.upsert({
      where: { taskId },
      update: {
        clientId: targetClientId,
        businessName,
        taskTitle,
        date,
        assignTo,
        workingOn: harshit.name,
        status,
        service,
        packageName: packageRaw,
        postType,
        notes
      },
      create: {
        taskId,
        clientId: targetClientId,
        businessName,
        taskTitle,
        date,
        assignTo,
        workingOn: harshit.name,
        status,
        service,
        packageName: packageRaw,
        postType,
        notes
      }
    });

    // Also update internal Task
    const existingTask = await prisma.task.findFirst({
      where: { title: taskTitle, assignedToId: harshit.id }
    });
    if (!existingTask) {
      await prisma.task.create({
        data: {
          title: taskTitle,
          description: `Client: ${businessName} | Task ID: ${taskId} | Service: ${service}`,
          status: status === 'Complete Task' || status === 'DONE' ? 'DONE' : 'TODO',
          assignedToId: harshit.id,
          createdById: adminId,
          dueDate: date || '2026-05-01'
        }
      });
    }

    assignedCount++;
  }

  console.log(`Assigned ${assignedCount} client tasks to ${harshit.name}.`);

  // Verify Tasks for Sanskruti Pre School
  const sanskruti = await prisma.clientTask.findMany({
    where: {
      businessName: { contains: 'Sanskruti', mode: 'insensitive' },
      workingOn: harshit.name
    }
  });
  console.log('\n=== SANSKRUTI PRE SCHOOL TASKS ASSIGNED TO HARSHIT GAJBHIYE ===');
  sanskruti.forEach(t => {
    console.log(`[${t.clientId}] ${t.businessName} | Task: ${t.taskTitle} | AssignTo: ${t.assignTo} | WorkingOn: ${t.workingOn}`);
  });

  const totalHarshitTasks = await prisma.clientTask.count({
    where: { workingOn: harshit.name }
  });
  console.log(`\nTotal ClientTasks assigned to ${harshit.name} in DB: ${totalHarshitTasks}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
