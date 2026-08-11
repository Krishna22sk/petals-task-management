import prisma from '../config/db.js';

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.json({ tasks: [], employees: [], projects: [] });
    }

    const query = q.trim();

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { task_title: { contains: query } },
          { description: { contains: query } },
          { task_code: { contains: query } },
        ],
      },
      take: 10,
    });

    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { designation: { contains: query } },
          { department: { contains: query } },
        ],
      },
      take: 10,
    });

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { project_name: { contains: query } },
          { project_code: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 10,
    });

    res.json({
      tasks: tasks.map((t) => ({ id: t.id, title: t.task_title, code: t.task_code, status: t.status })),
      employees: employees.map((e) => ({ id: e.id, name: e.name, email: e.email, role: e.role })),
      projects: projects.map((p) => ({ id: p.id, name: p.project_name, code: p.project_code, status: p.status })),
    });
  } catch (error) {
    next(error);
  }
};
