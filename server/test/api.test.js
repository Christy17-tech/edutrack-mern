process.env.NODE_ENV = 'test';
require('dotenv').config();
const http = require('http');
const connectDB = require('../src/config/db');
const seedData = require('../src/seed/seed');
const app = require('../src/server');

let server;
let baseUrl;

const request = async (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('--- Starting EduTrack API Integration Test Suite ---');

  // Explicitly connect and seed database for tests
  await connectDB();
  await seedData();

  // Start test server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[Test Suite] Server listening at ${baseUrl}`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  const assert = (name, condition, details = '') => {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ ${name} - FAILED: ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/api/health');
    assert('Health Check: returns status UP and 200 OK', health.status === 200 && health.body.status === 'UP');

    // 2. Public course catalog
    const courses = await request('/api/courses');
    assert(
      'Course Catalog: lists courses with pagination',
      courses.status === 200 && Array.isArray(courses.body.courses) && courses.body.courses.length > 0,
      JSON.stringify(courses.body)
    );

    // 3. Student Login
    const studentLogin = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'rahul.kumar@gmail.com', password: 'Student@123' },
    });
    assert(
      'Student Authentication: returns 200 and JWT token',
      studentLogin.status === 200 && !!studentLogin.body.token,
      JSON.stringify(studentLogin.body)
    );
    const studentToken = studentLogin.body.token;

    // 4. Protected route /api/auth/me
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      'Protected /auth/me: verifies user token and returns profile',
      meRes.status === 200 && meRes.body.user?.email === 'rahul.kumar@gmail.com',
      JSON.stringify(meRes.body)
    );

    // 5. Student Dashboard stats
    const studentStats = await request('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      'Dashboard Stats (Student): returns enrollment KPI metrics',
      studentStats.status === 200 && studentStats.body.stats?.totalEnrolled >= 1,
      JSON.stringify(studentStats.body)
    );

    // 6. Instructor Login
    const trainerLogin = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'priya.nair@ictkerala.org', password: 'Trainer@123' },
    });
    assert(
      'Instructor Authentication: returns 200 and JWT token',
      trainerLogin.status === 200 && !!trainerLogin.body.token,
      JSON.stringify(trainerLogin.body)
    );
    const trainerToken = trainerLogin.body.token;

    // 7. Student Directory (Instructor access)
    const studentsRes = await request('/api/users/students', {
      headers: { Authorization: `Bearer ${trainerToken}` },
    });
    assert(
      'Student Directory: Accessible to instructor and returns students list',
      studentsRes.status === 200 && Array.isArray(studentsRes.body.students) && studentsRes.body.students.length >= 1,
      JSON.stringify(studentsRes.body)
    );

    // 8. Role guard check (Student forbidden from viewing students directory)
    const studentForbidden = await request('/api/users/students', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      'Role Authorization Guard: Student receives 403 Forbidden on instructor route',
      studentForbidden.status === 403,
      `Status was ${studentForbidden.status}`
    );

    // 9. Course creation by trainer
    const newCourseRes = await request('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trainerToken}`,
      },
      body: {
        title: 'Integration Test Microservices',
        code: `TEST-${Date.now().toString().slice(-4)}`,
        department: 'Cloud Computing',
        description: 'Comprehensive test course for verification.',
        credits: 3,
        modules: [{ title: 'Intro', durationHours: 5, description: 'Basics' }],
      },
    });
    assert(
      'Course Creation: Instructor creates course and receives 201 Created',
      newCourseRes.status === 201 && !!newCourseRes.body.course,
      JSON.stringify(newCourseRes.body)
    );

    console.log(`\n🎉 Test Suite Completed: ${passed} passed, ${failed} failed.`);
  } catch (err) {
    console.error('Test Suite Exception:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
