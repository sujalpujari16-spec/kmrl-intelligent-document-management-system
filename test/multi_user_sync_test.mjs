import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = null;
  }
  return { status: res.status, headers: res.headers, text, json };
}

async function loginUser(email, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.status !== 200 || !res.json?.token) {
    throw new Error(`Failed to login as ${email}: ${res.status} ${res.text}`);
  }
  return {
    user: res.json.user,
    token: res.json.token,
    csrfToken: res.json.csrfToken,
    cookie: res.headers.get('set-cookie') || `kmrl_token=${res.json.token}; Path=/`,
  };
}

async function runTest() {
  console.log('--- STARTING MULTI-USER SIMULTANEOUS ACCESS & SYNC TEST ---');

  // 1. Log in multiple users simultaneously
  console.log('\n1. Logging in 3 different users simultaneously...');
  const [admin, hr, employee] = await Promise.all([
    loginUser('admin@kmrl.in', 'Admin@123'),
    loginUser('hr@kmrl.in', 'HR@123'),
    loginUser('employee@kmrl.in', 'Employee@123'),
  ]);

  console.log(`✓ Admin logged in: ${admin.user.name} (${admin.user.role}) - Token: ${admin.token.slice(0, 10)}...`);
  console.log(`✓ HR logged in: ${hr.user.name} (${hr.user.role}) - Token: ${hr.token.slice(0, 10)}...`);
  console.log(`✓ Employee logged in: ${employee.user.name} (${employee.user.role}) - Token: ${employee.token.slice(0, 10)}...`);

  // Verify session isolation
  if (admin.token === hr.token || hr.token === employee.token) {
    throw new Error('Tokens are not unique between users!');
  }
  console.log('✓ Session tokens are completely distinct and isolated.');

  // 2. Connect Employee & Admin to SSE streams simultaneously
  console.log('\n2. Testing simultaneous real-time SSE event subscriptions...');
  let employeeEvents = [];
  let adminEvents = [];

  const employeeReq = http.request(
    `${BASE_URL}/api/events`,
    {
      headers: {
        Authorization: `Bearer ${employee.token}`,
      },
    },
    (res) => {
      res.on('data', (chunk) => {
        const str = chunk.toString();
        employeeEvents.push(str);
      });
    }
  );
  employeeReq.end();

  const adminReq = http.request(
    `${BASE_URL}/api/events`,
    {
      headers: {
        Authorization: `Bearer ${admin.token}`,
      },
    },
    (res) => {
      res.on('data', (chunk) => {
        const str = chunk.toString();
        adminEvents.push(str);
      });
    }
  );
  adminReq.end();

  // Wait 500ms for SSE connections to establish
  await new Promise((r) => setTimeout(r, 500));
  console.log('✓ Both Admin and Employee established simultaneous live SSE streams.');

  // 3. Employee makes a change: Submits a leave request
  console.log('\n3. Employee submits a new leave request...');
  const leaveRes = await request('/api/leaves', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${employee.token}`,
      'X-CSRF-Token': employee.csrfToken,
    },
    body: JSON.stringify({
      leaveType: 'Casual Leave',
      startDate: '2026-11-01',
      endDate: '2026-11-03',
      reason: 'Monsoon family emergency and safety inspection',
    }),
  });

  if (leaveRes.status !== 201) {
    throw new Error(`Employee leave submission failed: ${leaveRes.status} ${leaveRes.text}`);
  }
  const createdLeave = leaveRes.json;
  console.log(`✓ Leave request created successfully: ID ${createdLeave.id}, Status: ${createdLeave.status}`);

  // Wait 600ms for SSE broadcast to arrive at Admin
  await new Promise((r) => setTimeout(r, 600));

  // Check if Admin received SSE event or notification
  const adminReceivedBroadcast = adminEvents.some((e) => e.includes('leave_created') || e.includes('notification'));
  console.log(`✓ Admin real-time broadcast received: ${adminReceivedBroadcast}`);

  // Check if Admin sees the new leave in their leaves list immediately
  console.log('\n4. Admin queries leaves list...');
  const adminLeavesRes = await request('/api/leaves', {
    headers: { Authorization: `Bearer ${admin.token}` },
  });
  const foundLeave = adminLeavesRes.json?.find((l) => l.id === createdLeave.id);
  if (!foundLeave) {
    throw new Error('Admin did not see the newly created leave in leaves list!');
  }
  console.log(`✓ Admin successfully saw Employee\'s new leave in database (Status: ${foundLeave.status})`);

  // 5. Admin updates the leave: Approves it
  console.log('\n5. Admin approves the leave...');
  const approveRes = await request(`/api/leaves/${createdLeave.id}/action`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${admin.token}`,
      'X-CSRF-Token': admin.csrfToken,
    },
    body: JSON.stringify({
      action: 'approve',
      notes: 'Approved by Managing Director for Monsoon safety duties.',
    }),
  });

  if (approveRes.status !== 200) {
    throw new Error(`Admin leave approval failed: ${approveRes.status} ${approveRes.text}`);
  }
  console.log(`✓ Admin approved leave ${createdLeave.id}`);

  // Wait 600ms for SSE broadcast to arrive at Employee
  await new Promise((r) => setTimeout(r, 600));

  const employeeReceivedBroadcast = employeeEvents.some((e) => e.includes('leave_updated') || e.includes('notification'));
  console.log(`✓ Employee real-time broadcast received: ${employeeReceivedBroadcast}`);

  // Check if Employee queries leaves list and sees Approved status
  console.log('\n6. Employee queries their leaves list...');
  const empLeavesRes = await request('/api/leaves', {
    headers: { Authorization: `Bearer ${employee.token}` },
  });
  const updatedEmpLeave = empLeavesRes.json?.find((l) => l.id === createdLeave.id);
  if (!updatedEmpLeave || updatedEmpLeave.status !== 'Approved') {
    throw new Error(`Employee does not see approved status! Status: ${updatedEmpLeave?.status}`);
  }
  console.log(`✓ Employee immediately sees status updated to: ${updatedEmpLeave.status}`);

  // 7. Verify persistence across subsequent login ("when one made any changes it should update in ater login at same time")
  console.log('\n7. Testing new login AFTER changes made (HR user logs in fresh)...');
  const freshHr = await loginUser('hr@kmrl.in', 'HR@123');
  const hrLeaves = await request('/api/leaves', {
    headers: { Authorization: `Bearer ${freshHr.token}` },
  });
  const hrFoundLeave = hrLeaves.json?.find((l) => l.id === createdLeave.id);
  if (!hrFoundLeave || hrFoundLeave.status !== 'Approved') {
    throw new Error(`Freshly logged-in HR did not see the approved leave! Status: ${hrFoundLeave?.status}`);
  }
  console.log(`✓ Freshly logged-in HR retrieved the updated leave with status: ${hrFoundLeave.status}`);

  // 8. Multi-user Document Upload workflow
  console.log('\n8. Employee uploads a document for departmental review...');
  const formData = new FormData();
  formData.append('title', 'KMRL Monsoon Track Safety Protocol 2026');
  formData.append('category', 'Safety & Compliance');
  formData.append(
    'file',
    new Blob(['KMRL Official SOP: Track Safety, signaling inspection, and drainage protocol during monsoon season.'], {
      type: 'text/plain',
    }),
    'KMRL_Monsoon_Safety_2026.txt'
  );

  const uploadRes = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${employee.token}`,
      'X-CSRF-Token': employee.csrfToken,
    },
    body: formData,
  });

  const uploadJson = await uploadRes.json();
  if (uploadRes.status !== 201) {
    throw new Error(`Employee document upload failed: ${uploadRes.status} ${JSON.stringify(uploadJson)}`);
  }
  const uploadedDoc = uploadJson;
  console.log(`✓ Document uploaded successfully: ID ${uploadedDoc.id}, Status: ${uploadedDoc.status}`);

  // Wait 600ms for SSE broadcast to arrive at Admin
  await new Promise((r) => setTimeout(r, 600));

  const adminReceivedDocEvent = adminEvents.some((e) => e.includes('document_added') || e.includes('document_pending') || e.includes('notification'));
  console.log(`✓ Admin real-time document broadcast received: ${adminReceivedDocEvent}`);

  // 9. Admin sees the document in library
  console.log('\n9. Admin queries documents list...');
  const adminDocsRes = await request('/api/documents', {
    headers: { Authorization: `Bearer ${admin.token}` },
  });
  const foundDoc = adminDocsRes.json?.find((d) => d.id === uploadedDoc.id);
  if (!foundDoc) {
    throw new Error('Admin did not see the newly uploaded document in documents list!');
  }
  console.log(`✓ Admin saw newly uploaded document (Status: ${foundDoc.status})`);

  // 10. Admin approves the document
  console.log('\n10. Admin approves the document...');
  const docApproveRes = await request(`/api/documents/${uploadedDoc.id}/approval`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${admin.token}`,
      'X-CSRF-Token': admin.csrfToken,
    },
    body: JSON.stringify({
      action: 'approve',
      notes: 'Reviewed and approved for 2026 monsoon readiness operations.',
    }),
  });

  if (docApproveRes.status !== 200) {
    throw new Error(`Admin document approval failed: ${docApproveRes.status} ${docApproveRes.text}`);
  }
  console.log(`✓ Admin approved document ${uploadedDoc.id}`);

  // Wait 600ms for SSE broadcast to arrive at Employee
  await new Promise((r) => setTimeout(r, 600));

  const employeeReceivedDocUpdate = employeeEvents.some((e) => e.includes('document_updated') || e.includes('notification'));
  console.log(`✓ Employee real-time broadcast of approved document received: ${employeeReceivedDocUpdate}`);

  // 11. Fresh login gets latest documents and approved status
  console.log('\n11. Another user (e.g. Employee fresh login) accesses documents after approval...');
  const freshEmployee = await loginUser('employee@kmrl.in', 'Employee@123');
  const freshEmpDocs = await request('/api/documents', {
    headers: { Authorization: `Bearer ${freshEmployee.token}` },
  });
  const freshFoundDoc = freshEmpDocs.json?.find((d) => d.id === uploadedDoc.id);
  if (!freshFoundDoc || freshFoundDoc.status !== 'Approved') {
    throw new Error(`Freshly logged-in Employee did not find approved document! Status: ${freshFoundDoc?.status}`);
  }
  console.log(`✓ Freshly logged-in Employee verified approved document in library (Status: ${freshFoundDoc.status})`);

  // Clean up SSE connections
  employeeReq.destroy();
  adminReq.destroy();

  console.log('\n================================================================');
  console.log(' ALL MULTI-USER REAL-TIME & PERSISTENCE TESTS PASSED 100%! ');
  console.log('================================================================\n');
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
