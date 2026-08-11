import prisma from '../config/db.js';
import { safeISOString } from '../utils/safeDate.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: true },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    const formatted = logs.map((log) => ({
      id: log.id,
      user: log.user ? log.user.name : 'System User',
      role: log.user ? log.user.role_id : 'System',
      action: log.action || 'ACTIVITY',
      details: log.description || '',
      timestamp: safeISOString(log.created_at),
      ipAddress: log.ip_address || '127.0.0.1',
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};
