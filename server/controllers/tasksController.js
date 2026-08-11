import prisma from '../config/db.js';
import { safeDateSplit, safeISOString } from '../utils/safeDate.js';
import { sendEmailNotification } from '../config/email.js';

const formatTask = (t) => {
  const empName = t.assignee_name || t.assigneeName || 'Unassigned';
  const tlName = t.assigned_by || t.assignedBy || 'Management';

  const cleanCode = (t.task_code && t.task_code.length <= 15) ? t.task_code : `TSK-${(t.id || '800').slice(0, 6).toUpperCase()}`;

  return {
    id: t.id,
    taskCode: cleanCode,
    title: t.task_title || t.title || 'Untitled Task',
    project: t.project_name || t.project || 'Petals Automation Platform',
    projectId: t.project_id || t.projectId,
    category: t.category || 'Engineering',
    priority: t.priority || 'Medium',
    status: t.status || 'Pending',
    assignedBy: tlName,
    teamLeaderName: tlName,
    assigneeName: empName,
    assignee: empName,
    assignedTo: t.assigned_to || t.assignedTo,
    dueDate: safeDateSplit(t.due_date || t.dueDate, '2026-08-31'),
    startDate: safeDateSplit(t.start_date || t.startDate, ''),
    estimatedTime: t.estimated_hours || t.estimatedTime || 0,
    actualTime: t.actual_hours || t.actualTime || 0,
    description: t.description || '',
    completionPercentage: t.completion_percentage || t.completionPercentage || 0,
    timerRunning: Boolean(t.timer_running),
    timerStartedAt: t.timer_started_at ? new Date(t.timer_started_at).getTime() : null,
    checklists: Array.isArray(t.checklists) ? t.checklists.map((c) => ({
      id: c.id,
      title: c.title,
      completed: Boolean(c.completed),
    })) : [],
    comments: Array.isArray(t.comments) ? t.comments.map((cm) => ({
      id: cm.id,
      text: cm.comment || cm.text || '',
      author: cm.author_name || cm.author || 'System User',
      avatar: cm.author_avatar || cm.avatar || '',
      createdAt: safeISOString(cm.created_at || cm.createdAt),
    })) : [],
    attachments: Array.isArray(t.attachments) ? t.attachments.map((att) => ({
      id: att.id,
      name: att.file_name || att.name || 'attachment',
      url: att.file_url || att.url || '',
      uploadedAt: safeISOString(att.uploaded_at || att.uploadedAt),
    })) : [],
  };
};

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, employeeId, search, projectId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.project_id = projectId;

    if (search) {
      where.OR = [
        { task_title: { contains: search } },
        { description: { contains: search } },
        { task_code: { contains: search } },
        { category: { contains: search } },
      ];
    }

    if (req.user && req.user.role === 'Employee') {
      const empName = req.user.name || '';
      const empFirstName = empName.split(' ')[0] || empName;
      where.OR = [
        { assigned_to: req.user.id },
        { assignee_name: { contains: empName } },
        { assignee_name: { contains: empFirstName } },
      ];
    } else if (employeeId) {
      where.OR = [
        { assigned_to: employeeId },
        { assignee_name: { contains: employeeId } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        checklists: true,
        comments: true,
        attachments: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(tasks.map(formatTask));
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        checklists: true,
        comments: true,
        attachments: true,
        time_trackings: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    }

    if (req.user && req.user.role === 'Employee') {
      const empName = req.user.name || '';
      const isAssigned = task.assigned_to === req.user.id || (task.assignee_name && task.assignee_name.includes(empName));
      if (!isAssigned) {
        return res.status(403).json({ error: 'Forbidden', message: 'Unauthorized to view this task' });
      }
    }

    res.json(formatTask(task));
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      projectId,
      category,
      priority,
      status,
      assigneeId,
      assigneeName,
      dueDate,
      startDate,
      estimatedTime,
      description,
      checklists,
    } = req.body;

    const taskCount = await prisma.task.count();
    const taskCode = `TSK-${800 + taskCount + 1}`;

    let projectName = 'Petals Automation Platform';
    if (projectId) {
      const proj = await prisma.project.findUnique({ where: { id: projectId } });
      if (proj) projectName = proj.project_name;
    }

    const newTask = await prisma.task.create({
      data: {
        task_code: taskCode,
        task_title: title,
        project_id: projectId || null,
        project_name: projectName,
        category: category || 'Engineering',
        priority: priority || 'Medium',
        status: status || 'Pending',
        assigned_by: req.user ? req.user.name : 'System Admin',
        assigned_to: assigneeId || null,
        assignee_name: assigneeName || 'Unassigned',
        due_date: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000),
        start_date: startDate ? new Date(startDate) : new Date(),
        estimated_hours: estimatedTime ? parseFloat(estimatedTime) : 0,
        description: description || '',
        checklists: {
          create: (checklists || []).map((item) => ({
            title: typeof item === 'string' ? item : item.title,
            completed: typeof item === 'object' && item.completed ? true : false,
          })),
        },
      },
      include: { checklists: true, comments: true, attachments: true },
    });

    prisma.activityLog.create({
      data: {
        user_id: req.user ? req.user.id : null,
        action: 'TASK_CREATED',
        description: `Task "${title}" (${taskCode}) created and assigned to ${assigneeName || 'Unassigned'}`,
      },
    }).catch(() => {});

    if (assigneeId) {
      const assigneeUser = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (assigneeUser && assigneeUser.email) {
        sendEmailNotification({
          to: assigneeUser.email,
          subject: `New Task Assigned: ${title} (${taskCode})`,
          text: `Hello ${assigneeUser.name},\n\nYou have been assigned a new task: "${title}". Due date: ${dueDate}.\n\n- Petals Automation`,
        }).catch(() => {});
      }
    }

    res.status(201).json(formatTask(newTask));
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found' });
    }

    if (req.user && req.user.role === 'Employee') {
      const empName = req.user.name || '';
      const isAssigned = existingTask.assigned_to === req.user.id || (existingTask.assignee_name && existingTask.assignee_name.includes(empName));
      if (!isAssigned) {
        return res.status(403).json({ error: 'Forbidden', message: 'Unauthorized to modify this task' });
      }
    }

    const data = {};
    if (body.title) data.task_title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.category) data.category = body.category;
    if (body.priority) data.priority = body.priority;
    if (body.status) data.status = body.status;
    if (body.dueDate) data.due_date = new Date(body.dueDate);
    if (body.estimatedTime !== undefined) data.estimated_hours = parseFloat(body.estimatedTime);
    if (body.actualTime !== undefined) data.actual_hours = parseFloat(body.actualTime);
    if (body.elapsedSeconds !== undefined) {
      data.actual_hours = parseFloat((body.elapsedSeconds / 3600).toFixed(2));
    }
    if (body.timerRunning !== undefined) {
      data.timer_running = Boolean(body.timerRunning);
    }
    if (body.timerStartedAt !== undefined) {
      data.timer_started_at = body.timerStartedAt ? new Date(body.timerStartedAt) : null;
    }
    if (body.status === 'Completed') {
      data.completion_percentage = 100;
      data.timer_running = false;
      data.timer_started_at = null;
    } else if (body.status === 'In Progress') {
      data.completion_percentage = 50;
    } else if (body.completionPercentage !== undefined) {
      data.completion_percentage = parseFloat(body.completionPercentage);
    }
    if (body.assigneeName) data.assignee_name = body.assigneeName;

    if (body.remarks && Array.isArray(body.remarks) && body.remarks.length > 0) {
      const latestRemark = body.remarks[body.remarks.length - 1];
      if (latestRemark && latestRemark.text) {
        await prisma.comment.create({
          data: {
            task_id: id,
            comment: latestRemark.text,
            author_name: latestRemark.author || (req.user ? req.user.name : 'System User'),
          },
        }).catch(() => {});
      }
    }

    if (body.checklists && Array.isArray(body.checklists)) {
      await prisma.taskChecklist.deleteMany({ where: { task_id: id } });
      await prisma.taskChecklist.createMany({
        data: body.checklists.map((ch) => ({
          task_id: id,
          title: ch.title,
          completed: ch.completed || false,
        })),
      });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data,
      include: { checklists: true, comments: true, attachments: true },
    });

    res.json(formatTask(updatedTask));
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        status,
        completion_percentage: status === 'Completed' ? 100.0 : status === 'In Progress' ? 50.0 : 0.0,
      },
      include: { checklists: true, comments: true, attachments: true },
    });

    prisma.activityLog.create({
      data: {
        user_id: req.user ? req.user.id : null,
        action: 'TASK_STATUS_CHANGED',
        description: `Task "${task.task_title}" status moved to "${status}"`,
      },
    }).catch(() => {});

    res.json({ message: 'Task status updated successfully', task: formatTask(task) });
  } catch (error) {
    next(error);
  }
};

export const updateTaskPriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: { priority },
      include: { checklists: true, comments: true, attachments: true },
    });

    res.json({ message: 'Task priority updated successfully', task: formatTask(task) });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findFirst({
      where: {
        OR: [
          { id },
          { task_code: id },
        ],
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Not Found', message: 'Task not found in database' });
    }

    if (req.user && req.user.role === 'Employee') {
      return res.status(403).json({ error: 'Forbidden', message: 'Employees are not authorized to delete tasks' });
    }

    // Cleanly remove child relation records first to avoid FK constraints
    await prisma.taskChecklist.deleteMany({ where: { task_id: task.id } }).catch(() => {});
    await prisma.comment.deleteMany({ where: { task_id: task.id } }).catch(() => {});
    await prisma.attachment.deleteMany({ where: { task_id: task.id } }).catch(() => {});
    await prisma.timeTracking.deleteMany({ where: { task_id: task.id } }).catch(() => {});

    await prisma.task.delete({ where: { id: task.id } });

    prisma.activityLog.create({
      data: {
        user_id: req.user ? req.user.id : null,
        action: 'TASK_DELETED',
        description: `Task "${task.task_title}" (${task.task_code || task.id}) was permanently deleted`,
      },
    }).catch(() => {});

    res.json({ success: true, message: 'Task deleted successfully', deletedId: task.id });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const newComment = await prisma.comment.create({
      data: {
        task_id: id,
        comment,
        comment_by: req.user ? req.user.id : null,
        author_name: req.user ? req.user.name : 'System User',
        author_avatar: req.user ? req.user.avatar || '' : '',
      },
    });

    res.status(201).json({
      id: newComment.id,
      text: newComment.comment,
      author: newComment.author_name,
      avatar: newComment.author_avatar,
      createdAt: safeISOString(newComment.created_at),
    });
  } catch (error) {
    next(error);
  }
};

export const addAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request', message: 'File is required for upload' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const attachment = await prisma.attachment.create({
      data: {
        task_id: id,
        file_name: req.file.originalname,
        file_url: fileUrl,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_by: req.user ? req.user.id : null,
      },
    });

    res.status(201).json({
      id: attachment.id,
      name: attachment.file_name,
      url: attachment.file_url,
      uploadedAt: safeISOString(attachment.uploaded_at),
    });
  } catch (error) {
    next(error);
  }
};

export const trackTime = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;

    const timeEntry = await prisma.timeTracking.create({
      data: {
        task_id: id,
        user_id: req.user ? req.user.id : 'usr-admin',
        duration: parseFloat(duration || 1),
      },
    });

    await prisma.task.update({
      where: { id },
      data: {
        actual_hours: { increment: parseFloat(duration || 1) },
      },
    });

    res.status(201).json({ message: 'Time logged successfully', timeEntry });
  } catch (error) {
    next(error);
  }
};
