import prisma from '../config/db.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const totalEmployees = await prisma.employee.count();
    const totalProjects = await prisma.project.count();
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({ where: { status: 'Completed' } });
    const pendingTasks = await prisma.task.count({ where: { status: 'Pending' } });
    const inProgressTasks = await prisma.task.count({ where: { status: 'In Progress' } });

    const now = new Date();
    const lateTasksCount = await prisma.task.count({
      where: {
        due_date: { lt: now },
        status: { notIn: ['Completed', 'Cancelled'] },
      },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysTasksCount = await prisma.task.count({
      where: {
        due_date: { gte: todayStart, lte: todayEnd },
      },
    });

    const employees = await prisma.employee.findMany({ take: 10 });
    const topPerformers = employees.map((e) => ({
      id: e.id,
      name: e.name,
      efficiency: e.efficiency || 100,
      tasksCompleted: e.tasks_count || 0,
    }));

    res.json({
      totalEmployees,
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      lateTasks: lateTasksCount,
      todaysTasks: todaysTasksCount,
      employeePerformance: {
        overallVelocity: 88.5,
        totalHoursLogged: 1240,
        sprintEfficiency: 94.2,
      },
      topPerformers,
      monthlyAnalytics: [
        { month: 'Jan', completed: 18, pending: 5 },
        { month: 'Feb', completed: 24, pending: 8 },
        { month: 'Mar', completed: 31, pending: 6 },
        { month: 'Apr', completed: 28, pending: 4 },
        { month: 'May', completed: 35, pending: 9 },
        { month: 'Jun', completed: 42, pending: 7 },
      ],
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeePerformance = async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany();
    const tasks = await prisma.task.findMany();

    const performance = employees.map((emp) => {
      const empTasks = tasks.filter((t) => t.assigned_to === emp.user_id || t.assignee_name === emp.name);
      const done = empTasks.filter((t) => t.status === 'Completed').length;
      const total = empTasks.length;
      const rate = total > 0 ? Math.round((done / total) * 100) : 100;

      return {
        employeeId: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        totalAssigned: total,
        totalCompleted: done,
        completionRate: rate,
        efficiencyScore: emp.efficiency || rate,
      };
    });

    res.json({
      overallVelocity: 88.5,
      totalHoursLogged: 1240,
      sprintEfficiency: 94.2,
      employees: performance,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskAnalytics = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany();
    const statusCounts = {
      Pending: tasks.filter((t) => t.status === 'Pending').length,
      'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
      Review: tasks.filter((t) => t.status === 'Review').length,
      Completed: tasks.filter((t) => t.status === 'Completed').length,
      'On Hold': tasks.filter((t) => t.status === 'On Hold').length,
      Cancelled: tasks.filter((t) => t.status === 'Cancelled').length,
    };

    const priorityCounts = {
      Low: tasks.filter((t) => t.priority === 'Low').length,
      Medium: tasks.filter((t) => t.priority === 'Medium').length,
      High: tasks.filter((t) => t.priority === 'High').length,
      Critical: tasks.filter((t) => t.priority === 'Critical').length,
    };

    res.json({
      totalTasks: tasks.length,
      byStatus: statusCounts,
      byPriority: priorityCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectAnalytics = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ include: { tasks: true } });

    const analytics = projects.map((p) => ({
      id: p.id,
      name: p.project_name,
      code: p.project_code,
      status: p.status,
      totalTasks: p.tasks.length,
      completedTasks: p.tasks.filter((t) => t.status === 'Completed').length,
      progressPercentage: p.progress_percentage,
    }));

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

export const getLateTasks = async (req, res, next) => {
  try {
    const now = new Date();
    const lateTasks = await prisma.task.findMany({
      where: {
        due_date: { lt: now },
        status: { notIn: ['Completed', 'Cancelled'] },
      },
    });
    res.json(lateTasks);
  } catch (error) {
    next(error);
  }
};

export const getCompletedTasks = async (req, res, next) => {
  try {
    const completed = await prisma.task.findMany({
      where: { status: 'Completed' },
      orderBy: { updated_at: 'desc' },
    });
    res.json(completed);
  } catch (error) {
    next(error);
  }
};

export const getUpcomingDeadlines = async (req, res, next) => {
  try {
    const now = new Date();
    const next7Days = new Date(Date.now() + 7 * 86400000);

    const upcoming = await prisma.task.findMany({
      where: {
        due_date: { gte: now, lte: next7Days },
        status: { notIn: ['Completed', 'Cancelled'] },
      },
      orderBy: { due_date: 'asc' },
    });

    res.json(upcoming);
  } catch (error) {
    next(error);
  }
};
