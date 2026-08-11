import prisma from '../config/db.js';
import { sendEmailNotification } from '../config/email.js';
import { safeISOString } from '../utils/safeDate.js';

export const getQueries = async (req, res, next) => {
  try {
    const where = {};
    if (req.user && req.user.role === 'Employee') {
      where.OR = [
        { employee_email: req.user.email },
        { employee_id: req.user.id },
      ];
    }

    const queries = await prisma.employeeQuery.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const formatted = queries.map((q, index) => {
      const code = `#QRY-${(q.id || String(index + 101)).slice(0, 6).toUpperCase()}`;
      return {
        id: q.id,
        queryCode: code,
        employeeId: q.employee_id || q.employeeId,
        employeeName: q.employee_name || 'Employee',
        employeeEmail: q.employee_email || '',
        subject: q.subject || 'Support Query',
        category: q.category || 'General Inquiry',
        priority: q.priority || 'Medium',
        message: q.message || '',
        status: q.status || 'Pending',
        timestamp: safeISOString(q.created_at),
        reply: typeof q.reply === 'string' ? (q.reply ? JSON.parse(q.reply) : null) : (q.reply || null),
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createQuery = async (req, res, next) => {
  try {
    const { employeeId, employeeName, employeeEmail, subject, category, priority, message } = req.body;

    const newQuery = await prisma.employeeQuery.create({
      data: {
        employee_id: employeeId || (req.user ? req.user.id : null),
        employee_name: employeeName || (req.user ? req.user.name : 'Employee'),
        employee_email: employeeEmail || (req.user ? req.user.email : ''),
        subject: subject || 'Support Query',
        category: category || 'General Inquiry',
        priority: priority || 'Normal',
        message: message || '',
        status: 'Pending',
      },
    });

    prisma.notification.create({
      data: {
        title: 'New Employee Query Received 📩',
        message: `${newQuery.employee_name} (${newQuery.employee_email}) submitted a query: "${subject}"`,
        role: 'Admin',
      },
    }).catch(() => {});

    res.status(201).json({
      id: newQuery.id,
      employeeId: newQuery.employee_id,
      employeeName: newQuery.employee_name,
      employeeEmail: newQuery.employee_email,
      subject: newQuery.subject,
      category: newQuery.category,
      priority: newQuery.priority,
      message: newQuery.message,
      status: newQuery.status,
      timestamp: safeISOString(newQuery.created_at),
      reply: null,
    });
  } catch (error) {
    next(error);
  }
};

export const replyQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { replyText, repliedBy } = req.body;

    const query = await prisma.employeeQuery.findUnique({ where: { id } });
    if (!query) {
      return res.status(404).json({ success: false, message: 'Employee query not found', code: 'NOT_FOUND' });
    }

    const replyObj = {
      text: replyText,
      repliedBy: repliedBy || (req.user ? req.user.name : 'HR Manager'),
      repliedAt: new Date().toISOString(),
    };

    const updated = await prisma.employeeQuery.update({
      where: { id },
      data: {
        status: 'Resolved',
        reply: JSON.stringify(replyObj),
      },
    });

    prisma.notification.create({
      data: {
        title: 'HR/Admin Replied to Your Query 💬',
        message: `HR responded to your query "${query.subject}": "${replyText}"`,
        target_employee_email: query.employee_email,
        user_id: query.employee_id,
      },
    }).catch(() => {});

    if (query.employee_email) {
      sendEmailNotification({
        to: query.employee_email,
        subject: `Response to your query: ${query.subject}`,
        text: `Hello ${query.employee_name},\n\nHR has responded to your query:\n\n"${replyText}"\n\n- Petals HR Team`,
      }).catch(() => {});
    }

    res.json({
      id: updated.id,
      employeeId: updated.employee_id,
      employeeName: updated.employee_name,
      employeeEmail: updated.employee_email,
      subject: updated.subject,
      category: updated.category,
      priority: updated.priority,
      message: updated.message,
      status: updated.status,
      timestamp: safeISOString(updated.created_at),
      reply: replyObj,
    });
  } catch (error) {
    next(error);
  }
};
