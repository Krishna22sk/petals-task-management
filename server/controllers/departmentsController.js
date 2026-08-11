import prisma from '../config/db.js';

export const getDepartments = async (req, res, next) => {
  try {
    const depts = await prisma.department.findMany();
    res.json(depts);
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { department_name, code } = req.body;
    const dept = await prisma.department.create({
      data: { department_name, code: code || department_name.substring(0, 3).toUpperCase() },
    });
    res.status(201).json(dept);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department_name, code } = req.body;
    const dept = await prisma.department.update({
      where: { id },
      data: { department_name, code },
    });
    res.json(dept);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id } });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};
