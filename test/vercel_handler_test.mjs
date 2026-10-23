import { createServer } from 'http';
import vercelHandler from '../api/index.cjs';

async function testVercelHandler() {
  console.log('--- TESTING VERCEL SERVERLESS HANDLER SIMULATION ---');

  // Create an HTTP server using the exact Vercel serverless export
  const server = createServer((req, res) => {
    // Simulate Vercel setting x-matched-path when rewriting /api/auth/login -> /api/index.cjs
    if (req.url === '/api/index' && req.headers['x-test-original-url']) {
      req.headers['x-matched-path'] = req.headers['x-test-original-url'];
    }
    vercelHandler(req, res);
  });

  await new Promise((resolve) => server.listen(3015, resolve));
  console.log('✓ Vercel test server running on port 3015');

  try {
    // 1. Test direct route /api/health
    const resHealth = await fetch('http://localhost:3015/api/health');
    const healthJson = await resHealth.json();
    if (resHealth.status !== 200 || healthJson.status !== 'healthy') {
      throw new Error(`Health check failed through Vercel handler: ${resHealth.status}`);
    }
    console.log('✓ Direct API invocation: /api/health -> 200 OK, healthy');

    // 2. Test Vercel rewrite simulation: URL is /api/index, but header x-matched-path is /api/auth/login
    const resLogin = await fetch('http://localhost:3015/api/index', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-original-url': '/api/auth/login',
      },
      body: JSON.stringify({
        email: 'admin@kmrl.in',
        password: 'Admin@123',
      }),
    });

    const loginText = await resLogin.text();
    let loginJson;
    try {
      loginJson = JSON.parse(loginText);
    } catch {
      throw new Error(`Login through rewritten Vercel function returned non-JSON: ${loginText}`);
    }

    if (resLogin.status !== 200 || !loginJson.token) {
      throw new Error(`Login failed through rewritten Vercel function: ${resLogin.status} ${loginText}`);
    }
    console.log(`✓ Rewritten Vercel route /api/index with x-matched-path /api/auth/login succeeded! User: ${loginJson.user.name}`);

    // 3. Test non-existent API route -> must return JSON 404, not HTML
    const resNotFound = await fetch('http://localhost:3015/api/non-existent-endpoint');
    const notFoundText = await resNotFound.text();
    let notFoundJson;
    try {
      notFoundJson = JSON.parse(notFoundText);
    } catch {
      throw new Error(`404 returned raw HTML instead of JSON: ${notFoundText}`);
    }
    if (resNotFound.status !== 404 || !notFoundJson.error) {
      throw new Error(`Unexpected 404 response: ${resNotFound.status}`);
    }
    console.log('✓ Unknown API route correctly returns structured JSON 404.');

    console.log('\n================================================================');
    console.log(' ALL VERCEL SERVERLESS DEPLOYMENT CHECKS PASSED 100%! ');
    console.log('================================================================\n');
  } finally {
    server.close();
  }
}

testVercelHandler().catch((err) => {
  console.error('VERCEL TEST FAILED:', err);
  process.exit(1);
});
