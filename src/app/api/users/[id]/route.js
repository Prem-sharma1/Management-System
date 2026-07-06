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
    const { name, email, password, role, department, salary, status, avatar } = body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (requester.role === 'ADMIN' && (targetUser.role === 'CEO' || targetUser.role === 'ADMIN') && !isSelf) {
      return NextResponse.json({ error: 'Admins cannot modify other Admins or CEOs' }, { status: 403 });
    }

    if (isSelf && !isPowerUser) {
      const updateData = {};
      if (avatar) updateData.avatar = avatar;
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
    if (name) data.name = name;
    if (email) data.email = email;
    if (department) data.department = department;
    if (avatar) data.avatar = avatar;
    if (status) data.status = status;
    
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data
    });

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
