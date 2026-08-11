import prisma from '../config/db.js';
import { safeDateSplit } from '../utils/safeDate.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: { tasks: true },
      orderBy: { created_at: 'desc' },
    });

    const formatted = projects.map((p) => {
      const taskList = Array.isArray(p.tasks) ? p.tasks : [];
      const totalTasks = taskList.length;
      const completedTasks = taskList.filter((t) => t.status === 'Completed').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (p.progress_percentage || 0);

      return {
        id: p.id,
        name: p.project_name || 'Untitled Project',
        code: p.project_code || p.id,
        category: p.category || 'Automation',
        description: p.description || '',
        status: p.status || 'Active',
        progress: progress,
        progressPercentage: progress,
        deadline: safeDateSplit(p.end_date, '2026-12-31'),
        startDate: safeDateSplit(p.start_date, ''),
        budgetHours: p.budget_hours || 0,
        loggedHours: p.logged_hours || taskList.reduce((sum, t) => sum + (t.actual_hours || 0), 0),
        teamLead: p.created_by || 'Team Leader',
        techStack: ['Automation', 'SCADA', 'Embedded'],
        tasksCount: totalTasks,
        completedTasksCount: completedTasks,
      };
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = await prisma.project.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!p) {
      return res.status(404).json({ success: false, message: 'Project not found', code: 'NOT_FOUND' });
    }

    const taskList = Array.isArray(p.tasks) ? p.tasks : [];
    const totalTasks = taskList.length;
    const completedTasks = taskList.filter((t) => t.status === 'Completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (p.progress_percentage || 0);

    res.json({
      id: p.id,
      name: p.project_name,
      code: p.project_code,
      category: p.category || 'Automation',
      description: p.description || '',
      status: p.status || 'Active',
      progress: progress,
      progressPercentage: progress,
      deadline: safeDateSplit(p.end_date, ''),
      startDate: safeDateSplit(p.start_date, ''),
      budgetHours: p.budget_hours || 0,
      loggedHours: p.logged_hours || 0,
      teamLead: p.created_by || 'Team Leader',
      techStack: ['Automation', 'SCADA', 'Embedded'],
      tasksCount: totalTasks,
      completedTasksCount: completedTasks,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { name, code, category, description, status, deadline, startDate, budgetHours, leadEmployeeId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Project name is required', code: 'VALIDATION_ERROR' });
    }

    const count = await prisma.project.count();
    const projectCode = code ? code.trim().toUpperCase() : `PRJ-${100 + count + 1}`;

    const existingCode = await prisma.project.findUnique({ where: { project_code: projectCode } });
    if (existingCode) {
      return res.status(409).json({ success: false, message: `Project code '${projectCode}' is already in use`, code: 'DUPLICATE_CODE' });
    }

    const newProject = await prisma.project.create({
      data: {
        project_name: name.trim(),
        project_code: projectCode,
        category: category || 'Automation & SCADA',
        description: description ? description.trim() : '',
        status: status || 'Active',
        end_date: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 86400000),
        start_date: startDate ? new Date(startDate) : new Date(),
        budget_hours: budgetHours ? parseInt(budgetHours) : 100,
        lead_employee_id: leadEmployeeId || null,
        created_by: req.user ? req.user.name : 'System Admin',
      },
    });

    prisma.activityLog.create({
      data: {
        user_id: req.user ? req.user.id : null,
        action: 'PROJECT_CREATED',
        description: `Project "${name}" (${projectCode}) created`,
      },
    }).catch(() => {});

    res.status(201).json({
      id: newProject.id,
      name: newProject.project_name,
      code: newProject.project_code,
      category: newProject.category,
      description: newProject.description,
      status: newProject.status,
      progress: 0,
      progressPercentage: 0,
      deadline: safeDateSplit(newProject.end_date, ''),
      startDate: safeDateSplit(newProject.start_date, ''),
      budgetHours: newProject.budget_hours,
      loggedHours: 0,
      teamLead: newProject.created_by,
      techStack: Array.isArray(req.body.techStack) ? req.body.techStack : ['Automation', 'SCADA'],
      tasksCount: 0,
      completedTasksCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const data = {};
    if (body.name) data.project_name = body.name.trim();
    if (body.code) data.project_code = body.code.toUpperCase().trim();
    if (body.category) data.category = body.category;
    if (body.description !== undefined) data.description = body.description;
    if (body.status) data.status = body.status;
    if (body.deadline) data.end_date = new Date(body.deadline);
    if (body.budgetHours !== undefined) data.budget_hours = parseInt(body.budgetHours);

    const updated = await prisma.project.update({
      where: { id },
      data,
    });

    res.json({
      id: updated.id,
      name: updated.project_name,
      code: updated.project_code,
      category: updated.category,
      description: updated.description,
      status: updated.status,
      progress: updated.progress_percentage || 0,
      progressPercentage: updated.progress_percentage || 0,
      deadline: safeDateSplit(updated.end_date, ''),
      startDate: safeDateSplit(updated.start_date, ''),
      budgetHours: updated.budget_hours,
      loggedHours: updated.logged_hours || 0,
      teamLead: updated.created_by || 'Team Leader',
      techStack: Array.isArray(body.techStack) ? body.techStack : ['Automation', 'SCADA'],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });

    prisma.activityLog.create({
      data: {
        user_id: req.user ? req.user.id : null,
        action: 'PROJECT_DELETED',
        description: `Project ${id} deleted`,
      },
    }).catch(() => {});

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
