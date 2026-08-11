// Refactored Mock Data with Role-Based Access Control for Petals Automation

export const MOCK_USERS = [
  {
    id: 'usr-admin',
    email: 'admin@petals.com',
    password: 'admin123',
    name: 'Sarah Jenkins',
    role: 'Admin', // Admin / HR
    designation: 'VP of Human Resources & Operations',
    department: 'Human Resources & Executive',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-tl',
    email: 'tl@petals.com',
    password: 'tl123',
    name: 'Rajesh Kulkarni',
    role: 'Team Leader',
    designation: 'Embedded Systems Lead Engineer',
    department: 'Embedded Systems',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  }
];

export const MOCK_DEPARTMENTS = [
  'Embedded Systems',
  'Embedded Developer',
  'SCADA Software',
  'Software Developer',
  'Hardware & PCB',
  'Business Development Executive',
  'Digital Marketing',
  'Accountant',
  'Designer',
  'Trainee',
  'Human Resources & Executive'
];

export const MOCK_EMPLOYEES = [
  {
    id: 'emp-01',
    user_id: 'usr-admin',
    name: 'Sarah Jenkins',
    email: 'admin@petals.com',
    role: 'Admin',
    designation: 'VP of Human Resources',
    department: 'Human Resources & Executive',
    phone: '+1-555-0192',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    tasksCount: 5,
    efficiency: 99.2
  },
  {
    id: 'emp-02',
    user_id: 'usr-tl',
    name: 'Rajesh Kulkarni',
    email: 'tl@petals.com',
    role: 'Team Leader',
    designation: 'Embedded Systems Lead',
    department: 'Embedded Systems',
    phone: '+1-555-0144',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tasksCount: 8,
    efficiency: 96.5
  }
];

export const MOCK_PROJECTS = [
  {
    id: 'prj-101',
    name: 'STM32 Dual-Core Motor Controller Firmware',
    code: 'PRJ-101',
    category: 'Embedded Software',
    description: 'High-speed motor control algorithm for industrial robotic actuators using STM32H7 dual-core MCUs.',
    status: 'In Progress',
    startDate: '2026-06-01',
    deadline: '2026-08-30',
    budgetHours: 160,
    loggedHours: 84,
    progressPercentage: 65,
    tasksCount: 3,
    completedTasksCount: 1
  },
  {
    id: 'prj-102',
    name: 'SCADA Cloud Monitoring Suite v4',
    code: 'PRJ-102',
    category: 'SCADA Software',
    description: 'Next-generation telemetry dashboard for remote water treatment plant sensors.',
    status: 'In Progress',
    startDate: '2026-07-01',
    deadline: '2026-09-15',
    budgetHours: 200,
    loggedHours: 45,
    progressPercentage: 35,
    tasksCount: 2,
    completedTasksCount: 1
  }
];

export const MOCK_TASKS = [
  {
    id: 'TSK-801',
    taskCode: 'TSK-801',
    title: 'Implement Fieldbus CANopen Driver Protocol Stack',
    project: 'STM32 Dual-Core Motor Controller Firmware',
    projectId: 'prj-101',
    category: 'Embedded Software',
    priority: 'Critical',
    status: 'In Progress',
    assignedBy: 'Rajesh Kulkarni',
    assigneeName: 'Rajesh Kulkarni',
    assignedTo: 'usr-tl',
    dueDate: '2026-08-18',
    startDate: '2026-08-01',
    estimatedTime: 24,
    actualTime: 18,
    completionPercentage: 60,
    description: 'Configure CANopen Node-ID assignment, SDO expedited transfer protocol, and PDO mapping for high-speed servo drives.',
    checklists: [
      { id: 'chk-1', title: 'Initialize CAN peripheral registers', completed: true },
      { id: 'chk-2', title: 'Implement NMT state machine transitions', completed: true },
      { id: 'chk-3', title: 'Verify PDO transmission jitter on oscilloscope', completed: false }
    ],
    comments: [
      { id: 'cm-1', text: 'CAN filter banks configured for 1Mbps baud rate.', author: 'Rajesh Kulkarni', avatar: '', createdAt: '2026-08-05T10:00:00.000Z' }
    ],
    attachments: []
  },
  {
    id: 'TSK-802',
    taskCode: 'TSK-802',
    title: 'Integrate Real-Time Modbus TCP Gateway Engine',
    project: 'SCADA Cloud Monitoring Suite v4',
    projectId: 'prj-102',
    category: 'SCADA Software',
    priority: 'High',
    status: 'Pending',
    assignedBy: 'Sarah Jenkins',
    assigneeName: 'Sarah Jenkins',
    assignedTo: 'usr-admin',
    dueDate: '2026-08-25',
    startDate: '2026-08-02',
    estimatedTime: 32,
    actualTime: 4,
    completionPercentage: 15,
    description: 'Develop async Modbus TCP client layer in Node.js to stream sensor data directly into PostgreSQL telemetry table.',
    checklists: [],
    comments: [],
    attachments: []
  },
  {
    id: 'TSK-803',
    taskCode: 'TSK-803',
    title: 'Design 24V Isolated Power Supply Circuit',
    project: 'STM32 Dual-Core Motor Controller Firmware',
    projectId: 'prj-101',
    category: 'Hardware & PCB',
    priority: 'High',
    status: 'Review',
    assignedBy: 'Rajesh Kulkarni',
    assigneeName: 'Rajesh Kulkarni',
    assignedTo: 'usr-tl',
    dueDate: '2026-08-28',
    startDate: '2026-08-03',
    estimatedTime: 20,
    actualTime: 19,
    completionPercentage: 90,
    description: 'High-efficiency buck regulator design with low EMI emissions for harsh industrial environments.',
    checklists: [],
    comments: [],
    attachments: []
  },
  {
    id: 'TSK-804',
    taskCode: 'TSK-804',
    title: 'Perform HMI Touchscreen EMI/EMC Noise Immunity Tests',
    project: 'SCADA Cloud Monitoring Suite v4',
    projectId: 'prj-102',
    category: 'Testing & QA',
    priority: 'Medium',
    status: 'Completed',
    assignedBy: 'Sarah Jenkins',
    assigneeName: 'Sarah Jenkins',
    assignedTo: 'usr-admin',
    dueDate: '2026-08-10',
    startDate: '2026-08-01',
    estimatedTime: 16,
    actualTime: 16,
    completionPercentage: 100,
    description: 'Electromagnetic compatibility stress testing under IEC 61000-4-4 ESD surge standards.',
    checklists: [],
    comments: [],
    attachments: []
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Welcome to Petals Automation Task SaaS 🌸',
    message: 'System operational with instant live REST API & disk database sync.',
    timestamp: new Date().toISOString(),
    unread: true,
    role: 'Admin'
  }
];

export const MOCK_ACTIVITIES = [
  {
    id: 'log-1',
    user: 'Sarah Jenkins',
    role: 'Admin',
    action: 'SYSTEM_INITIALIZED',
    details: 'Petals Automation Enterprise Task SaaS initialized and ready',
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  }
];

export const MOCK_COMPANY_SETTINGS = {
  name: 'Petals Automation Pvt Ltd',
  website: 'https://petalsautomation.com',
  notificationDefaults: {
    emailOnAssign: true,
    emailOnOverdue: true
  }
};
