import prisma from '../config/db.js';

export const getRoles = async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      include: { role_permissions: { include: { permission: true } } },
    });
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { role_name, description } = req.body;
    const role = await prisma.role.create({
      data: { role_name, description },
    });
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role_name, description } = req.body;
    const role = await prisma.role.update({
      where: { id },
      data: { role_name, description },
    });
    res.json(role);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { id } });
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    next(error);
  }
};
