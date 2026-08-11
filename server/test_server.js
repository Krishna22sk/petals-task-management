import http from 'http';
import app from './server.js';

const PORT = 5002;
let server;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Petals Automation REST API Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request('/api/health');
    assert(health.status === 200 && health.data.status === 'OK', 'GET /api/health returns HTTP 200 OK');

    // 2. Auth Login (Admin)
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@petals.com', password: 'admin123' },
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'POST /api/auth/login succeeds & returns JWT token');
    const adminToken = loginRes.data.token;

    // 3. Auth Me
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(meRes.status === 200 && meRes.data.email === 'admin@petals.com', 'GET /api/auth/me returns current user profile');

    // 4. Tasks List
    const tasksRes = await request('/api/tasks', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(tasksRes.status === 200 && Array.isArray(tasksRes.data), 'GET /api/tasks returns array of tasks');

    // 5. Create Task
    const newTaskRes = await request('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        title: 'Automated API Test Task Card',
        category: 'Embedded Software',
        priority: 'High',
        status: 'Pending',
        dueDate: '2026-08-25',
        description: 'Generated during automated backend test run.',
      },
    });
    assert(newTaskRes.status === 201 && newTaskRes.data.title === 'Automated API Test Task Card', 'POST /api/tasks dispatches new task card');
    const createdTaskId = newTaskRes.data.id;

    // 6. Update Task Status
    const patchStatusRes = await request(`/api/tasks/${createdTaskId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'In Progress' },
    });
    assert(patchStatusRes.status === 200, 'PATCH /api/tasks/:id/status updates task status');

    // 7. Projects List
    const projRes = await request('/api/projects', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(projRes.status === 200 && Array.isArray(projRes.data), 'GET /api/projects returns array of projects');

    // 8. Employees List
    const empRes = await request('/api/employees', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(empRes.status === 200 && Array.isArray(empRes.data), 'GET /api/employees returns array of employees');

    // 9. Dashboard Reports
    const dashboardRes = await request('/api/reports/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(dashboardRes.status === 200 && dashboardRes.data.totalTasks !== undefined, 'GET /api/reports/dashboard returns summary metrics');

    // 10. Global Search
    const searchRes = await request('/api/search?q=CANopen', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(searchRes.status === 200 && searchRes.data.tasks, 'GET /api/search returns query results');

    console.log(`\n==================================================`);
    console.log(`🏁 Test Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==================================================\n`);

  } catch (err) {
    console.error('Test Runner Exception:', err);
  } finally {
    if (server) server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

server = app.listen(PORT, () => {
  runTests();
});
