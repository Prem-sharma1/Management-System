import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

async function getRequester(cookieStore) {
  const userIdStr = cookieStore.get('userId')?.value;
  if (!userIdStr) return null;
  return await prisma.user.findUnique({ where: { id: parseInt(userIdStr) } });
}

export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isSelf = requester.id === id;
    const isPowerUser = requester.role === 'CEO' || requester.role === 'ADMIN';

    if (!isSelf && !isPowerUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, email, password, role, department, salary, status, avatar,
      address, dob, exp, designation, mobile, lastSalary, dateOfJoining,
      passportPhoto, aadharCard, panCard, marksheet10, marksheet12, graduation, otherDoc, works
    } = body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (requester.role === 'ADMIN' && (targetUser.role === 'CEO' || targetUser.role === 'ADMIN') && !isSelf) {
      return NextResponse.json({ error: 'Admins cannot modify other Admins or CEOs' }, { status: 403 });
    }

    if (isSelf && !isPowerUser) {
      const updateData = {};
      if (avatar !== undefined) updateData.avatar = avatar;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      await prisma.user.update({
        where: { id },
        data: updateData
      });

      return NextResponse.json({ success: true });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (department !== undefined) data.department = department;
    if (avatar !== undefined) data.avatar = avatar;
    if (status !== undefined) data.status = status;
    if (address !== undefined) data.address = address;
    if (dob !== undefined) data.dob = dob;
    if (exp !== undefined) data.exp = exp;
    if (designation !== undefined) data.designation = designation;
    if (mobile !== undefined) data.mobile = mobile;
    if (lastSalary !== undefined) data.lastSalary = parseFloat(lastSalary) || 0;
    if (dateOfJoining !== undefined) data.dateOfJoining = dateOfJoining;
    if (passportPhoto !== undefined) data.passportPhoto = passportPhoto;
    if (aadharCard !== undefined) data.aadharCard = aadharCard;
    if (panCard !== undefined) data.panCard = panCard;
    if (marksheet10 !== undefined) data.marksheet10 = marksheet10;
    if (marksheet12 !== undefined) data.marksheet12 = marksheet12;
    if (graduation !== undefined) data.graduation = graduation;
    if (otherDoc !== undefined) data.otherDoc = otherDoc;
    if (works !== undefined) data.works = works;
    
    if (salary !== undefined) {
      if (requester.role === 'CEO') {
        data.salary = parseFloat(salary);
      } else {
        if (parseFloat(salary) !== targetUser.salary) {
          return NextResponse.json({ error: 'Only CEO can change salary' }, { status: 403 });
        }
      }
    }

    if (role) {
      if (requester.role === 'ADMIN' && (role === 'CEO' || role === 'ADMIN')) {
        return NextResponse.json({ error: 'Admins cannot assign CEO or Admin roles' }, { status: 403 });
      }
      data.role = role;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);
    }

    const oldName = targetUser.name;

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

    if (oldName && updatedUser.name && oldName.trim().toLowerCase() !== updatedUser.name.trim().toLowerCase()) {
      const oldNameTrimmed = oldName.trim();
      const newNameTrimmed = updatedUser.name.trim();

      await prisma.clientTask.updateMany({
        where: {
          workingOn: { equals: oldNameTrimmed, mode: 'insensitive' }
        },
        data: {
          workingOn: newNameTrimmed
        }
      });

      await prisma.clientDelivery.updateMany({
        where: {
          workingOn: { equals: oldNameTrimmed, mode: 'insensitive' }
        },
        data: {
          workingOn: newNameTrimmed
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        action: `Updated user ${updatedUser.name} (${id})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    const { password: _, ...safeUser } = updatedUser;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('User PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const cookieStore = await cookies();
    const requester = await getRequester(cookieStore);

    if (!requester || (requester.role !== 'CEO' && requester.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (requester.role === 'ADMIN' && (targetUser.role === 'CEO' || targetUser.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Admins cannot delete other Admins or CEOs' }, { status: 403 });
    }

    if (requester.id === id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Delete all call records associated with this user
    await prisma.callRecord.deleteMany({
      where: { salesPersonId: id }
    });

    // Delete all tasks assigned to or created by this user
    await prisma.task.deleteMany({
      where: {
        OR: [
          { assignedToId: id },
          { createdById: id }
        ]
      }
    });

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: `Deleted user ${targetUser.name} (${id})`,
        performedByName: requester.name,
        performedByRole: requester.role
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
