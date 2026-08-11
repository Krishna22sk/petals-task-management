import prisma from '../config/db.js';
import { safeISOString } from '../utils/safeDate.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    const formatted = notifications.map((n) => ({
      id: n.id,
      title: n.title || 'Notification',
      message: n.message || '',
      timestamp: safeISOString(n.created_at),
      unread: Boolean(!n.is_read),
      role: n.role || 'Admin',
      targetUserId: n.user_id,
      targetEmployeeEmail: n.target_employee_email,
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      data: { is_read: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
