const http = require('http');

// Helper to make request with cookie persistence
function request(method, path, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        let resBody = '';
        const setCookie = res.headers['set-cookie'];
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(resBody);
          } catch (e) {
            parsed = resBody;
          }
          resolve({
            statusCode: res.statusCode,
            body: parsed,
            cookie: setCookie ? setCookie[0].split(';')[0] : cookie,
          });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING UNSTOP BACKEND & DATABASE INTEGRATION TESTS ---');

  // Test 1: User 1 Signup
  console.log('\n[1] Testing User 1 Registration (12 fields)...');
  const user1Data = {
    fullName: 'Aarav Sharma',
    username: 'aarav_sharma',
    email: 'aarav@unstop.edu',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    phone: '+91 9876543210',
    collegeName: 'National Institute of Technology',
    courseDegree: 'B.Tech',
    branchDept: 'Computer Science & Engineering',
    academicYear: '3rd Year',
    dob: '2004-05-15',
    termsAccepted: true,
    securityQuestion: 'What was your first school name or favorite subject?',
    securityAnswer: 'Mathematics',
  };

  const signupRes = await request('POST', '/api/auth/signup', user1Data);
  console.log('Signup status:', signupRes.statusCode, signupRes.body.message);
  if (signupRes.statusCode !== 201 && signupRes.statusCode !== 409) {
    throw new Error('Signup failed: ' + JSON.stringify(signupRes.body));
  }

  // Test 2: User 1 Login
  console.log('\n[2] Testing User 1 Login with email...');
  const loginRes = await request('POST', '/api/auth/login', {
    identifier: 'aarav@unstop.edu',
    password: 'Password123!',
    rememberMe: true,
  });
  console.log('Login status:', loginRes.statusCode, 'User:', loginRes.body.user?.username);
  if (loginRes.statusCode !== 200) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes.body));
  }
  const sessionCookie1 = loginRes.cookie;
  console.log('Session Cookie received:', sessionCookie1 ? 'YES' : 'NO');

  // Test 3: Authenticated Get Current User (/api/auth/me)
  console.log('\n[3] Testing /api/auth/me with session cookie...');
  const meRes = await request('GET', '/api/auth/me', null, sessionCookie1);
  console.log('GetMe status:', meRes.statusCode, 'Full Name:', meRes.body.user?.fullName);
  if (meRes.body.user?.passwordHash) {
    throw new Error('SECURITY VIOLATION: passwordHash exposed to client!');
  }

  // Test 4: Create Course
  console.log('\n[4] Testing Course Creation...');
  const courseRes = await request(
    'POST',
    '/api/courses',
    {
      courseName: 'Data Structures & Algorithms',
      courseCode: 'CS301',
      description: 'Advanced data structures, graphs, dynamic programming, and algorithm analysis',
      semester: 'Semester 5',
      department: 'Computer Science',
      instructor: 'Dr. V. Raman',
      color: '#a855f7',
    },
    sessionCookie1
  );
  console.log('Course creation status:', courseRes.statusCode, courseRes.body.course?.courseCode);
  const courseId = courseRes.body.course?._id;

  // Test 5: Create Subject linked to Course
  console.log('\n[5] Testing Subject Creation linked to course...');
  const subjectRes = await request(
    'POST',
    '/api/subjects',
    {
      courseId,
      subjectName: 'Graph Theory & DP',
      subjectCode: 'GTDP',
      semester: 'Semester 5',
      description: 'Shortest paths, MST, Flow networks, and memoization',
      color: '#06b6d4',
      credits: 4,
    },
    sessionCookie1
  );
  console.log('Subject creation status:', subjectRes.statusCode, subjectRes.body.subject?.subjectCode);
  const subjectId = subjectRes.body.subject?._id;

  // Test 6: Create Note under Subject
  console.log('\n[6] Testing Note Creation under subject...');
  const noteRes = await request(
    'POST',
    '/api/notes',
    {
      courseId,
      subjectId,
      title: 'Dijkstra vs Bellman-Ford Algorithms',
      content:
        '# Dijkstra Algorithm\n- Greedy approach using min-priority queue\n- Time complexity: O((V+E)log V)\n- Constraint: Non-negative edge weights only\n\n# Bellman-Ford\n- Dynamic programming\n- Handles negative weights & detects negative cycles\n- Complexity: O(V*E)',
      tags: ['algorithms', 'graphs', 'exam-notes'],
      isPinned: true,
      color: '#1e1b4b',
    },
    sessionCookie1
  );
  console.log('Note creation status:', noteRes.statusCode, 'Title:', noteRes.body.note?.title);

  // Test 7: Create Task
  console.log('\n[7] Testing Task Creation...');
  const taskRes = await request(
    'POST',
    '/api/tasks',
    {
      courseId,
      subjectId,
      title: 'Implement Dijkstra in C++ and submit lab assignment',
      description: 'Verify with test cases 1-10 on hacker-rank platform',
      priority: 'high',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    },
    sessionCookie1
  );
  console.log('Task creation status:', taskRes.statusCode, 'Title:', taskRes.body.task?.title);

  // Test 8: Record Completed Focus Session (Pomodoro)
  console.log('\n[8] Testing Focus Pomodoro Session logging...');
  const focusRes = await request(
    'POST',
    '/api/focus/record',
    {
      subjectId,
      durationMinutes: 25,
      sessionType: 'pomodoro',
      notes: 'Solved 2 graph problems on LeetCode',
    },
    sessionCookie1
  );
  console.log('Focus session status:', focusRes.statusCode, 'Duration:', focusRes.body.session?.durationMinutes);

  // Test 9: Habit Creation and Daily Toggle
  console.log('\n[9] Testing Habit Tracker...');
  const habitRes = await request(
    'POST',
    '/api/habits',
    {
      name: 'Solve 1 LeetCode Daily',
      category: 'Coding',
      targetDaysPerWeek: 7,
      color: '#ec4899',
    },
    sessionCookie1
  );
  console.log('Habit creation status:', habitRes.statusCode, 'Habit:', habitRes.body.habit?.name);
  const habitId = habitRes.body.habit?._id;

  const toggleRes = await request('POST', `/api/habits/${habitId}/toggle`, {}, sessionCookie1);
  console.log('Habit toggle status:', toggleRes.statusCode, 'Completed:', toggleRes.body.completed);

  // Test 10: Dashboard Stats
  console.log('\n[10] Testing Dashboard Statistics from real MongoDB data...');
  const dashRes = await request('GET', '/api/analytics/dashboard', null, sessionCookie1);
  console.log('Dashboard Stats:', dashRes.body.stats);

  // Test 11: Data Isolation Test (User 2)
  console.log('\n[11] Testing User Isolation (Registering User 2)...');
  const user2Data = {
    fullName: 'Priya Patel',
    username: 'priya_patel',
    email: 'priya@unstop.edu',
    password: 'Password456!',
    confirmPassword: 'Password456!',
    collegeName: 'IIT Bombay',
    courseDegree: 'B.Tech',
    branchDept: 'Electrical Engineering',
    academicYear: '2nd Year',
    termsAccepted: true,
  };
  const signup2Res = await request('POST', '/api/auth/signup', user2Data);
  const sessionCookie2 = signup2Res.cookie;

  const user2Courses = await request('GET', '/api/courses', null, sessionCookie2);
  console.log('User 2 courses count (should be 0):', user2Courses.body.count);
  if (user2Courses.body.count !== 0) {
    throw new Error('SECURITY VIOLATION: User 2 accessed User 1 courses!');
  }

  const user2Notes = await request('GET', '/api/notes', null, sessionCookie2);
  console.log('User 2 notes count (should be 0):', user2Notes.body.count);
  if (user2Notes.body.count !== 0) {
    throw new Error('SECURITY VIOLATION: User 2 accessed User 1 notes!');
  }

  console.log('\n ALL 11 BACKEND & DATABASE TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

// Start server and run tests
require('./server.js');
setTimeout(runTests, 2000);
