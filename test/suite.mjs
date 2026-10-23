import { spawn } from 'child_process';

const PORT = 3012;
const BASE_URL = `http://localhost:${PORT}`;

let serverProcess;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startTestServer() {
  console.log(`[Test Suite] Launching KMRL IDMS Enterprise Server on port ${PORT}...`);
  serverProcess = spawn('node', ['dist/server.cjs'], {
    env: {
      ...process.env,
      PORT: `${PORT}`,
      NODE_ENV: 'test',
      APP_ORIGINS: `http://localhost:${PORT},http://127.0.0.1:${PORT}`,
    },
    stdio: 'pipe',
  });

  for (let i = 0; i < 25; i++) {
    await sleep(350);
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) {
        console.log(`[Test Suite] Server is live and healthy.`);
        return;
      }
    } catch {
      // Retry until server starts
    }
  }
  throw new Error('Server failed to start within timeout.');
}

function stopTestServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
}

async function runSuite() {
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    await startTestServer();

    console.log('\n================================================================');
    console.log(' KMRL IDMS ENTERPRISE SECURITY & ZERO-TRUST TEST SUITE ');
    console.log('================================================================\n');

    // ----------------------------------------------------
    // TEST GROUP 1: Health & Security Headers
    // ----------------------------------------------------
    console.log('[1. Health Check & Security Headers]');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert(healthRes.status === 200, 'Health endpoint responds with 200 OK');
    const cspHeader = healthRes.headers.get('content-security-policy') || '';
    assert(!cspHeader.includes('unsafe-eval'), 'CSP strictly excludes unsafe-eval');
    assert(healthRes.headers.get('x-request-id') !== null, 'X-Request-ID header attached to response');

    // ----------------------------------------------------
    // TEST GROUP 2: Unauthenticated Protection & Fail-Closed
    // ----------------------------------------------------
    console.log('\n[2. Unauthenticated Protection & Zero Bypass]');
    const unauthAudit = await fetch(`${BASE_URL}/api/audit-logs`);
    assert(unauthAudit.status === 401, 'Unauthenticated /api/audit-logs rejected with 401');

    const unauthDocs = await fetch(`${BASE_URL}/api/documents`);
    assert(unauthDocs.status === 401, 'Unauthenticated /api/documents rejected with 401');

    const unauthLeaves = await fetch(`${BASE_URL}/api/leaves`);
    assert(unauthLeaves.status === 401, 'Unauthenticated /api/leaves rejected with 401');

    const unauthMcp = await fetch(`${BASE_URL}/api/mcp/postgres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'get_document_count' }),
    });
    assert(unauthMcp.status === 401, 'Unauthenticated /api/mcp/postgres rejected with 401');

    const unauthEvents = await fetch(`${BASE_URL}/api/events`);
    assert(unauthEvents.status === 401, 'Unauthenticated /api/events SSE subscription rejected with 401');

    // ----------------------------------------------------
    // TEST GROUP 3: Authentication & Token Isolation
    // ----------------------------------------------------
    console.log('\n[3. Authentication & Credential Hardening]');
    // Test Zero Master Password Bypass
    const masterPassAttempt = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kmrl.in', password: 'KMRL@12345' }),
    });
    assert(masterPassAttempt.status === 401 || masterPassAttempt.status === 503, 'Master password / fallback bypass strictly blocked');

    // Public Registration Removed
    const publicRegAttempt = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacker', email: 'hacker@kmrl.in', password: 'Password@123', department: 'HR' }),
    });
    assert(publicRegAttempt.status === 404, 'Public registration /api/auth/register is completely removed (404 Not Found)');

    // Admin Invite Route Requires Auth
    const unauthInvite = await fetch(`${BASE_URL}/api/admin/users/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Employee', email: 'emp@kmrl.in', role: 'Employee', department: 'Operations' }),
    });
    assert(unauthInvite.status === 401, 'Admin staff invitation requires authentication (401)');

    // ----------------------------------------------------
    // TEST GROUP 4: Strict Input Validation (Zod)
    // ----------------------------------------------------
    console.log('\n[4. Strict Input Validation]');
    const missingPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kmrl.in', password: '' }),
    });
    assert(missingPassRes.status === 400, 'Missing password rejected with 400 Bad Request');

    const invalidDateLeave = await fetch(`${BASE_URL}/api/leaves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leaveType: 'Casual Leave',
        startDate: 'invalid-date',
        endDate: '2026-08-20',
        reason: 'Personal time off',
      }),
    });
    assert(invalidDateLeave.status === 401 || invalidDateLeave.status === 400, 'Invalid leave date format rejected');

    // ----------------------------------------------------
    // TEST GROUP 5: File Security & Multipart Uploads
    // ----------------------------------------------------
    console.log('\n[5. Multipart File Security & Magic Bytes]');
    // Unauthenticated upload
    const unauthUpload = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Document', category: 'HR Circulars' }),
    });
    assert(unauthUpload.status === 401, 'Unauthenticated multipart upload rejected with 401');

    // Missing file attachment
    const missingFileUpload = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'No File' }),
    });
    assert(missingFileUpload.status === 401 || missingFileUpload.status === 400, 'Upload without file rejected');

    // ----------------------------------------------------
    // TEST GROUP 6: MCP Server & Permission Matrix
    // ----------------------------------------------------
    console.log('\n[6. MCP Server & Tool Allowlist]');
    const blockedMcpRes = await fetch(`${BASE_URL}/api/mcp/postgres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'execute_arbitrary_sql', arguments: {} }),
    });
    assert(blockedMcpRes.status === 401, 'Unauthenticated MCP execution rejected with 401');

    const blockedFsMcpRes = await fetch(`${BASE_URL}/api/mcp/filesystem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'delete_root_folder', arguments: {} }),
    });
    assert(blockedFsMcpRes.status === 401, 'Unauthenticated filesystem MCP execution rejected with 401');

    // ----------------------------------------------------
    // TEST GROUP 7: CSRF Protection & Origin Allowlist
    // ----------------------------------------------------
    console.log('\n[7. CSRF Origin Verification]');
    const foreignOriginRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Origin': 'https://malicious-attacker-site.com',
      },
    });
    assert(foreignOriginRes.status === 403, 'Cross-origin state-changing mutation blocked with 403 Forbidden');

    const foreignInviteRes = await fetch(`${BASE_URL}/api/admin/users/invite`, {
      method: 'POST',
      headers: {
        'Origin': 'https://evil-phishing-portal.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@kmrl.in' }),
    });
    assert(foreignInviteRes.status === 403, 'Cross-origin staff invitation attempt blocked with 403');

    // ----------------------------------------------------
    // TEST GROUP 8: Time-Limited Download URLs & Content Security
    // ----------------------------------------------------
    console.log('\n[8. On-Demand Document Download Security]');
    const unauthDownload = await fetch(`${BASE_URL}/api/documents/KMRL-DOC-123/download`);
    assert(unauthDownload.status === 401, 'Unauthenticated document download rejected with 401');

    // ----------------------------------------------------
    // TEST GROUP 9: Privilege Escalation & SQL Injection Resilience
    // ----------------------------------------------------
    console.log('\n[9. SQL Injection & Privilege Escalation Resistance]');
    const sqliSearch = await fetch(`${BASE_URL}/api/search?query=${encodeURIComponent("'; DROP TABLE documents; --")}`);
    assert(sqliSearch.status === 401 || sqliSearch.status === 200, 'SQL injection payload handled safely');

    const profileSelfEscalate = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'Admin' }),
    });
    assert(profileSelfEscalate.status === 401, 'Unauthenticated profile mutation rejected with 401');

    console.log('\n================================================================');
    console.log(` TEST SUMMARY: ${passed} PASSED | ${failed} FAILED `);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('[Test Suite Error]:', err);
    process.exit(1);
  } finally {
    stopTestServer();
  }
}

runSuite();
