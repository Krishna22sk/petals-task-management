import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { sendEmailNotification } from '../config/email.js';

export const getEmployees = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { created_at: 'desc' },
    });

    const formatted = employees.map((e) => ({
      id: e.id,
      userId: e.user_id,
      name: e.name,
      email: e.email,
      role: e.role,
      designation: e.designation || 'Engineer',
      department: e.department || 'Embedded Systems',
      phone: e.phone || '',
      status: e.status,
      avatar: e.avatar || '',
      tasksCount: e.tasks_count || 0,
      efficiency: e.efficiency || 100,
      createdAt: e.created_at,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const emp = await prisma.employee.findUnique({ where: { id } });

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found', code: 'NOT_FOUND' });
    }

    res.json(emp);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, role, designation, department, phone, password, avatar } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required fields', code: 'VALIDATION_ERROR' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for duplicate employee/user email
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists', code: 'DUPLICATE_EMAIL' });
    }

    // Role & Department resolution
    let roleObj = await prisma.role.findFirst({ where: { role_name: role || 'Employee' } });
    if (!roleObj) {
      roleObj = await prisma.role.create({ data: { role_name: role || 'Employee' } });
    }

    let deptObj = null;
    if (department) {
      deptObj = await prisma.department.findFirst({ where: { department_name: department } });
      if (!deptObj) {
        deptObj = await prisma.department.create({ data: { department_name: department, code: department.substring(0, 3).toUpperCase() } });
      }
    }

    const plainPassword = password || '123456';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Atomic transaction for User + Employee + ActivityLog
    const [newUser, newEmp] = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          name,
          email: cleanEmail,
          password: hashedPassword,
          role_id: roleObj.id,
          department_id: deptObj ? deptObj.id : undefined,
          designation_id: designation || 'Engineer',
          profile_image: avatar || '',
        },
      });

      const e = await tx.employee.create({
        data: {
          user_id: u.id,
          name,
          email: cleanEmail,
          role: role || 'Employee',
          designation: designation || 'Engineer',
          department: department || 'Embedded Systems',
          phone: phone || '',
          avatar: avatar || '',
          status: 'Active',
        },
      });

      await tx.activityLog.create({
        data: {
          user_id: req.user ? req.user.id : u.id,
          action: 'EMPLOYEE_CREATED',
          description: `Employee ${name} (${cleanEmail}) was created`,
        },
      });

      return [u, e];
    });

    sendEmailNotification({
      to: cleanEmail,
      subject: 'Welcome to Petals Automation Task Management',
      text: `Hello ${name},\n\nYour employee account has been created. Role: ${role || 'Employee'}.`,
    }).catch(() => {});

    res.status(201).json({
      id: newEmp.id,
      userId: newUser.id,
      name: newEmp.name,
      email: newEmp.email,
      role: newEmp.role,
      designation: newEmp.designation,
      department: newEmp.department,
      phone: newEmp.phone,
      status: newEmp.status,
      avatar: newEmp.avatar,
      tasksCount: 0,
      efficiency: 100,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const emp = await prisma.employee.findUnique({ where: { id } });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found', code: 'NOT_FOUND' });
    }

    const updatedEmp = await prisma.employee.update({
      where: { id },
      data: {
        name: body.name || emp.name,
        role: body.role || emp.role,
        designation: body.designation || emp.designation,
        department: body.department || emp.department,
        phone: body.phone || emp.phone,
        status: body.status || emp.status,
        avatar: body.avatar || emp.avatar,
      },
    });

    res.json(updatedEmp);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const emp = await prisma.employee.findFirst({
      where: {
        OR: [{ id }, { user_id: id }, { email: id }]
      }
    });
    
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found', code: 'NOT_FOUND' });
    }

    // Unassign tasks assigned to this employee
    await prisma.task.updateMany({
      where: { assigned_to: emp.user_id },
      data: { assigned_to: null, assignee_name: 'Unassigned' }
    }).catch(() => {});

    // Delete associated records in transaction/cascade
    await prisma.timeTracking.deleteMany({ where: { user_id: emp.user_id } }).catch(() => {});
    await prisma.comment.deleteMany({ where: { comment_by: emp.user_id } }).catch(() => {});
    await prisma.notification.deleteMany({ where: { user_id: emp.user_id } }).catch(() => {});

    await prisma.employee.delete({ where: { id: emp.id } }).catch(() => {});
    if (emp.user_id) {
      await prisma.user.delete({ where: { id: emp.user_id } }).catch(() => {});
    }

    prisma.activityLog.create({
      data: {
        user_id: req.user ? req.user.id : null,
        action: 'EMPLOYEE_DELETED',
        description: `Employee ${emp.name} (${emp.email}) was deleted`,
      },
    }).catch(() => {});

    res.json({ success: true, message: 'Employee and user account deleted successfully' });
  } catch (error) {
    next(error);
  }
};
