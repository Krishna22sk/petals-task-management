import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Roles
  const roles = [
    { role_name: 'Admin', description: 'Full system access and security administration' },
    { role_name: 'HR', description: 'Employee management and organizational policy' },
    { role_name: 'Manager', description: 'Project management and high-level scheduling' },
    { role_name: 'Team Leader', description: 'Task assignment, workflow review and team oversight' },
    { role_name: 'Employee', description: 'Task execution, time tracking, and daily workflow' },
    { role_name: 'Intern', description: 'Trainee engineer with read-only task viewing' },
  ];

  const roleMap = {};
  for (const r of roles) {
    const created = await prisma.role.upsert({
      where: { role_name: r.role_name },
      update: {},
      create: r,
    });
    roleMap[r.role_name] = created.id;
  }

  // 2. Create Departments
  const departments = [
    { department_name: 'Embedded Systems', code: 'EMB' },
    { department_name: 'SCADA & Industrial Software', code: 'SCD' },
    { department_name: 'Hardware & PCB Design', code: 'PCB' },
    { department_name: 'Human Resources & Executive', code: 'HRE' },
    { department_name: 'Digital Marketing & Sales', code: 'DMS' },
  ];

  const deptMap = {};
  for (const d of departments) {
    const created = await prisma.department.upsert({
      where: { department_name: d.department_name },
      update: {},
      create: d,
    });
    deptMap[d.department_name] = created.id;
  }

  // 3. Create Default Accounts (Admin and Team Leader only)
  const defaultPasswordHash = await bcrypt.hash('admin123', 10);
  const tlPasswordHash = await bcrypt.hash('tl123', 10);

  const users = [
    {
      id: 'usr-admin',
      name: 'Sarah Jenkins',
      email: 'admin@petals.com',
      password: defaultPasswordHash,
      role_id: roleMap['Admin'],
      department_id: deptMap['Human Resources & Executive'],
      designation_id: 'VP of Human Resources & Operations',
      profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-tl',
      name: 'Rajesh Kulkarni',
      email: 'tl@petals.com',
      password: tlPasswordHash,
      role_id: roleMap['Team Leader'],
      department_id: deptMap['Embedded Systems'],
      designation_id: 'Embedded Systems Lead Engineer',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    }
  ];

  for (const u of users) {
    const userRecord = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });

    const roleName = u.email === 'admin@petals.com' ? 'Admin' : 'Team Leader';
    await prisma.employee.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: `emp-${u.id}`,
        user_id: userRecord.id,
        name: u.name,
        email: u.email,
        role: roleName,
        designation: u.designation_id,
        department: u.email.includes('admin') ? 'Human Resources & Executive' : 'Embedded Systems',
        avatar: u.profile_image,
        tasks_count: 5,
        efficiency: 99.0,
      },
    });
  }

  // 4. Create Initial Projects
  const project1 = await prisma.project.upsert({
    where: { project_code: 'PRJ-101' },
    update: {},
    create: {
      id: 'prj-101',
      project_name: 'STM32 Dual-Core Motor Controller Firmware',
      project_code: 'PRJ-101',
      category: 'Embedded Software',
      description: 'High-speed motor control algorithm for industrial robotic actuators using STM32H7 dual-core MCUs.',
      status: 'In Progress',
      start_date: new Date('2026-06-01'),
      end_date: new Date('2026-08-30'),
      budget_hours: 160,
      logged_hours: 84,
      progress_percentage: 65.0,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { project_code: 'PRJ-102' },
    update: {},
    create: {
      id: 'prj-102',
      project_name: 'SCADA Cloud Monitoring Suite v4',
      project_code: 'PRJ-102',
      category: 'SCADA Software',
      description: 'Next-generation telemetry dashboard for remote water treatment plant sensors.',
      status: 'In Progress',
      start_date: new Date('2026-07-01'),
      end_date: new Date('2026-09-15'),
      budget_hours: 200,
      logged_hours: 45,
      progress_percentage: 35.0,
    },
  });

  // 5. Create Initial Tasks
  await prisma.task.upsert({
    where: { id: 'TSK-801' },
    update: {},
    create: {
      id: 'TSK-801',
      task_code: 'TSK-801',
      task_title: 'Implement Fieldbus CANopen Driver Protocol Stack',
      project_id: project1.id,
      project_name: project1.project_name,
      category: 'Embedded Software',
      priority: 'Critical',
      status: 'In Progress',
      assigned_by: 'Rajesh Kulkarni',
      assignee_name: 'Rajesh Kulkarni',
      assigned_to: 'usr-tl',
      due_date: new Date('2026-08-12'),
      estimated_hours: 24,
      actual_hours: 18,
      completion_percentage: 60.0,
      description: 'Configure CANopen Node-ID assignment, SDO expedited transfer protocol, and PDO mapping for high-speed servo drives.',
    },
  });

  await prisma.task.upsert({
    where: { id: 'TSK-802' },
    update: {},
    create: {
      id: 'TSK-802',
      task_code: 'TSK-802',
      task_title: 'Integrate Real-Time Modbus TCP Gateway Engine',
      project_id: project2.id,
      project_name: project2.project_name,
      category: 'SCADA Software',
      priority: 'High',
      status: 'Pending',
      assigned_by: 'Sarah Jenkins',
      assignee_name: 'Sarah Jenkins',
      assigned_to: 'usr-admin',
      due_date: new Date('2026-08-18'),
      estimated_hours: 32,
      actual_hours: 4,
      completion_percentage: 15.0,
      description: 'Develop async Modbus TCP client layer in Node.js to stream sensor data directly into PostgreSQL telemetry table.',
    },
  });

  // 6. Create Initial Activities
  await prisma.activityLog.createMany({
    data: [
      {
        user_id: 'usr-admin',
        action: 'SYSTEM_INITIALIZED',
        description: 'Petals Automation Enterprise Task SaaS Backend initialized with PostgreSQL & Prisma',
      },
      {
        user_id: 'usr-tl',
        action: 'TASK_ASSIGNED',
        description: 'Assigned CANopen Protocol Stack task TSK-801 to Rajesh Kulkarni',
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
