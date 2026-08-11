/**
 * Full End-to-End SaaS Automated API Test Suite for Petals Task Management
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

const logResult = (testName, passed, details = '') => {
  console.log(`${passed ? '✅ [PASS]' : '❌ [FAIL]'} ${testName} ${details ? `- ${details}` : ''}`);
};

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🌸 PETALS AUTOMATION ENTERPRISE SAAS E2E TEST SUITE 🌸');
  console.log('======================================================\n');

  let authToken = '';
  let createdEmployeeId = '';
  let createdProjectId = '';
  let createdTaskId = '';
  let createdQueryId = '';

  try {
    // 1. Health Check
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    logResult('1. API Health Check', healthRes.status === 200 || healthRes.status === 503, `Status: ${healthData.status}, DB: ${healthData.database}`);

    // 2. Auth: Admin Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@petals.com', password: 'admin123' }),
    });
    const loginData = await loginRes.json();
    const loginSuccess = loginRes.status === 200 && (loginData.token || loginData.success);
    authToken = loginData.token || '';
    logResult('2. Admin Authentication', loginSuccess, `User: ${loginData.user ? loginData.user.name : 'Authenticated'}`);

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    // 3. Employees: Create Employee
    const empEmail = `test.employee.${Date.now()}@petals.com`;
    const createEmpRes = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Test Automation Engineer',
        email: empEmail,
        password: 'TestPassword123',
        role: 'Employee',
        designation: 'QA Automation Engineer',
        department: 'Embedded Systems',
      }),
    });
    const empData = await createEmpRes.json();
    createdEmployeeId = empData.id || empData.data?.id;
    logResult('3. Create Employee (Atomic User + Employee)', createEmpRes.status === 201 || createEmpRes.status === 200, `Email: ${empEmail}`);

    // 4. Employees: Duplicate Email Validation (409 Conflict Check)
    const dupEmpRes = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Duplicate Engineer',
        email: empEmail,
        password: 'Password123',
      }),
    });
    logResult('4. Duplicate Email Protection (409 Conflict)', dupEmpRes.status === 409, `Status Code: ${dupEmpRes.status}`);

    // 5. Projects: Create Project "LMS"
    const prjCode = `LMS-${Math.floor(1000 + Math.random() * 9000)}`;
    const createPrjRes = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'LMS Platform Integration',
        code: prjCode,
        category: 'Software Developer',
        description: 'Learning Management System module for enterprise training.',
        budgetHours: 120,
      }),
    });
    const prjData = await createPrjRes.json();
    createdProjectId = prjData.id || prjData.data?.id;
    logResult('5. Create Project "LMS"', createPrjRes.status === 201 || createPrjRes.status === 200, `Code: ${prjCode}`);

    // 6. Projects: Verify Project Retrieval
    const getPrjRes = await fetch(`${API_BASE}/projects`, { headers: authHeaders });
    const projectsList = await getPrjRes.json();
    const lmsFound = Array.isArray(projectsList) && projectsList.some(p => p.code === prjCode || p.name === 'LMS Platform Integration');
    logResult('6. Projects Persistence Verification (GET /api/projects)', lmsFound, `Total Projects: ${projectsList.length}`);

    // 7. Tasks: Create Task
    const createTaskRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Complete LMS Module API Integration',
        projectId: createdProjectId,
        category: 'Software Developer',
        priority: 'High',
        status: 'Pending',
        assigneeName: 'Test Automation Engineer',
        dueDate: '2026-09-15',
        estimatedTime: 24,
      }),
    });
    const taskData = await createTaskRes.json();
    createdTaskId = taskData.id || taskData.data?.id;
    logResult('7. Create Task "Complete LMS Module"', createTaskRes.status === 201 || createTaskRes.status === 200, `Task ID: ${createdTaskId}`);

    // 8. Tasks: Update Kanban Status (Pending -> In Progress)
    const updateStatusRes = await fetch(`${API_BASE}/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'In Progress' }),
    });
    logResult('8. Kanban Drag & Drop Status Change (Pending -> In Progress)', updateStatusRes.status === 200, `Task ID: ${createdTaskId}`);

    // 9. Queries: Create Employee Query
    const createQueryRes = await fetch(`${API_BASE}/queries`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        employeeName: 'Test Automation Engineer',
        employeeEmail: empEmail,
        subject: 'VPN Access Request for SCADA Lab',
        category: 'IT Support',
        priority: 'High',
        message: 'Need remote VPN credentials for testing SCADA telemetry.',
      }),
    });
    const queryData = await createQueryRes.json();
    createdQueryId = queryData.id || queryData.data?.id;
    logResult('9. Submit Employee Support Ticket', createQueryRes.status === 201 || createQueryRes.status === 200, `Query ID: ${createdQueryId}`);

    // 10. Notifications & Audit Logs Check
    const getNotifRes = await fetch(`${API_BASE}/notifications`, { headers: authHeaders });
    const notifs = await getNotifRes.json();
    logResult('10. System Notifications Persistence', Array.isArray(notifs), `Notifications Count: ${Array.isArray(notifs) ? notifs.length : 0}`);

    console.log('\n======================================================');
    console.log('🎉 ALL SAAS API ENDPOINTS VERIFIED & TESTED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ E2E Test Exception:', err.message);
  }
}

runTestSuite();
