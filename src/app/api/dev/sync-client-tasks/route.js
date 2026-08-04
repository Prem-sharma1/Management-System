import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetClientId = searchParams.get('clientId') || 'AID-0007';
    const targetSm = searchParams.get('sm') || 'Pujan';
    const targetPoster = searchParams.get('poster') || 'CREATOR';
    const targetGraphic = searchParams.get('c') || 'Danish Khan';
    const targetReel = searchParams.get('r') || 'Sanmeet';
    const targetAi = searchParams.get('a') || 'Divyansh';

    const users = await prisma.user.findMany();
    const findUser = (name) => users.find(u => u.name.toLowerCase() === name.toLowerCase());

    const smUser = findUser(targetSm);
    const posterUser = (targetPoster !== 'CREATOR') ? findUser(targetPoster) : null;
    const graphicUser = findUser(targetGraphic);
    const reelUser = findUser(targetReel);
    const aiUser = findUser(targetAi);
    const harshitUser = findUser('Harshit');

    // 1. Account Management & Reports -> smUser (Pujan)
    if (smUser) {
      await prisma.clientTask.updateMany({
        where: {
          clientId: targetClientId,
          OR: [
            { postType: { in: ['Onboarding', 'Access', 'Setup', 'Ads', 'Report', 'Weekly Report'] } },
            { taskTitle: { contains: 'Client Login', mode: 'insensitive' } },
            { taskTitle: { contains: 'Access', mode: 'insensitive' } },
            { taskTitle: { contains: 'Weekly Report', mode: 'insensitive' } },
            { taskTitle: { contains: 'Ads Run', mode: 'insensitive' } }
          ]
        },
        data: { workingOn: smUser.name }
      });
    }

    // 2. Graphic Creatives
    if (graphicUser) {
      await prisma.clientTask.updateMany({
        where: {
          clientId: targetClientId,
          OR: [
            { postType: 'Graphic' },
            { taskTitle: { contains: 'Graphic' } }
          ],
          NOT: { taskTitle: { startsWith: 'Post ' } }
        },
        data: { workingOn: graphicUser.name }
      });

      const postGraphicUser = posterUser ? posterUser.name : graphicUser.name;
      await prisma.clientTask.updateMany({
        where: {
          clientId: targetClientId,
          taskTitle: { contains: 'Post Graphic' }
        },
        data: { workingOn: postGraphicUser }
      });
    }

    // 3. Reels
    if (reelUser) {
      await prisma.clientTask.updateMany({
        where: {
          clientId: targetClientId,
          OR: [
            { postType: 'Reel' },
            { taskTitle: { contains: 'Reel' } }
          ],
          NOT: { taskTitle: { startsWith: 'Post ' } }
        },
        data: { workingOn: reelUser.name }
      });

      const postReelUser = posterUser ? posterUser.name : reelUser.name;
      await prisma.clientTask.updateMany({
        where: {
          clientId: targetClientId,
          taskTitle: { contains: 'Post Reel' }
        },
        data: { workingOn: postReelUser }
      });
    }

    // 4. AI Videos
    if (aiUser) {
      await prisma.clientTask.updateMany({
        where: {
          clientId: targetClientId,
          OR: [
            { postType: 'AI Video' },
            { taskTitle: { contains: 'AI Video' } }
          ],
          NOT: { taskTitle: { startsWith: 'Post ' } },
          NOT: { postType: 'Script' }
        },
        data: { workingOn: aiUser.name }
      });

      const postAiUser = posterUser ? posterUser.name : aiUser.name;
      await prisma.clientTask.updateMany({
        where: {
          clientId: targetClientId,
          taskTitle: { contains: 'Post AI Video' }
        },
        data: { workingOn: postAiUser }
      });
    }

    // 5. Scripts
    if (harshitUser) {
      await prisma.clientTask.updateMany({
        where: {
          clientId: targetClientId,
          postType: 'Script'
        },
        data: { workingOn: harshitUser.name }
      });
    }

    const updatedClientTasks = await prisma.clientTask.findMany({
      where: { clientId: targetClientId },
      select: { taskId: true, taskTitle: true, postType: true, workingOn: true }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully resynced tasks for client ${targetClientId}`,
      tasks: updatedClientTasks
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
