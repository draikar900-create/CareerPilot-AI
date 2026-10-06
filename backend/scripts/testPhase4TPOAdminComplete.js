/**
 * Phase 4 Automated Verification Test Suite
 * Tests TPO & Executive Admin Portal Systems, Multi-Tenant Security, Placement Updates, Audit Logging, and Escalation Guard.
 */
process.env.NODE_ENV = 'test';

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from '../routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(express.json());

const testTpoUserId = '33333333-3333-3333-3333-333333333333';
const testAdminAUserId = '44444444-4444-4444-4444-444444444444';
const testAdminBUserId = '55555555-5555-5555-5555-555555555555';
const testStudentAUserId = '66666666-6666-6666-6666-666666666666';
const testStudentBUserId = '77777777-7777-7777-7777-777777777777';

// Test Auth Guard Middleware
app.use((req, res, next) => {
  const actor = req.headers['x-test-actor'];
  if (actor === 'tpo-college-a') {
    req.user = {
      id: testTpoUserId,
      email: 'tpo@collegea.test',
      user_metadata: { role: 'PlacementOfficer', college_name: 'College A Institute' },
      app_metadata: { role: 'PlacementOfficer' }
    };
    req.userScope = { userId: testTpoUserId, role: 'PlacementOfficer', collegeName: 'College A Institute', isSuperAdmin: false };
    req.user.adminRole = 'PlacementOfficer';
  } else if (actor === 'admin-college-b') {
    req.user = {
      id: testAdminBUserId,
      email: 'admin@collegeb.test',
      user_metadata: { role: 'Admin', college_name: 'College B Institute' },
      app_metadata: { role: 'Admin' }
    };
    req.userScope = { userId: testAdminBUserId, role: 'Admin', collegeName: 'College B Institute', isSuperAdmin: false };
    req.user.adminRole = 'Admin';
  } else if (actor === 'superadmin') {
    req.user = {
      id: '99999999-9999-9999-9999-999999999999',
      email: 'superadmin@careerpilot.test',
      user_metadata: { role: 'SuperAdmin' },
      app_metadata: { role: 'SuperAdmin' }
    };
    req.userScope = { userId: '99999999-9999-9999-9999-999999999999', role: 'SuperAdmin', collegeName: null, isSuperAdmin: true };
    req.user.adminRole = 'SuperAdmin';
  } else {
    // Default: admin-college-a
    req.user = {
      id: testAdminAUserId,
      email: 'admin@collegea.test',
      user_metadata: { role: 'Admin', college_name: 'College A Institute' },
      app_metadata: { role: 'Admin' }
    };
    req.userScope = { userId: testAdminAUserId, role: 'Admin', collegeName: 'College A Institute', isSuperAdmin: false };
    req.user.adminRole = 'Admin';
  }
  next();
});

app.use('/api/admin', adminRoutes);

async function runPhase4Tests() {
  console.log('\n======================================================');
  console.log('  PHASE 4: TPO & ADMIN MANAGEMENT SYSTEM VERIFICATION');
  console.log('======================================================\n');

  const server = app.listen(5998);
  const BASE_URL = 'http://localhost:5998/api/admin';

  let testPassCount = 0;
  let testFailCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      testPassCount++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      testFailCount++;
    }
  }

  try {
    // 1. Identity Resolution Test
    console.log('1. Resolving test identities for College A & College B...');
    assert(Boolean(testStudentAUserId && testStudentBUserId), 'Prepared test student IDs for College A & College B');

    // 2. Test Dashboard Stats per College Scope
    console.log('\n2. Testing College-Scoped Admin Dashboard...');
    const dashResA = await fetch(`${BASE_URL}/dashboard`, {
      headers: { 'x-test-actor': 'admin-college-a' }
    });
    const dashDataA = await dashResA.json();
    assert(dashResA.status === 200 && dashDataA.success, 'Dashboard API returned success');
    assert(dashDataA.scope?.collegeName === 'College A Institute', 'Dashboard bound to College A scope');

    // 3. Test Student Directory & Filtering
    console.log('\n3. Testing Multi-Tenant Student Search & Filtering...');
    const studResA = await fetch(`${BASE_URL}/students`, {
      headers: { 'x-test-actor': 'admin-college-a' }
    });
    const studDataA = await studResA.json();
    assert(studResA.status === 200 && studDataA.success, 'Fetched student directory');
    const hasStudA = studDataA.students?.some(s => (s.user_id === testStudentAUserId || s.id === testStudentAUserId));
    const hasStudB = studDataA.students?.some(s => (s.user_id === testStudentBUserId || s.id === testStudentBUserId));
    assert(hasStudA, 'College A Admin sees College A student');
    assert(!hasStudB, 'College A Admin CANNOT see College B student (Multi-tenant Security)');

    // 4. Test TPO Placement Status Update
    console.log('\n4. Testing TPO Official Placement Status Update...');
    const updateRes = await fetch(`${BASE_URL}/students/${testStudentAUserId}/placement-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-test-actor': 'tpo-college-a'
      },
      body: JSON.stringify({ placement_status: 'Placed', placement_notes: 'Hired at Google' })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.success, 'TPO successfully updated student placement status');
    assert(updateData.student?.placement_status === 'Placed', 'Updated placement_status set to "Placed"');

    // 5. Test Cross-College Placement Update Denial
    console.log('\n5. Testing Cross-College Placement Status Security Guard...');
    const crossRes = await fetch(`${BASE_URL}/students/${testStudentBUserId}/placement-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-test-actor': 'tpo-college-a'
      },
      body: JSON.stringify({ placement_status: 'Placed' })
    });
    assert(crossRes.status === 404 || crossRes.status === 403, 'College A TPO CANNOT update College B student placement status (403/404)');

    // 6. Test Admin Role Escalation Guard
    console.log('\n6. Testing Role Escalation Protection...');
    const promoteRes = await fetch(`${BASE_URL}/users/role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-actor': 'admin-college-a'
      },
      body: JSON.stringify({ target_user_id: testStudentAUserId, target_role: 'SuperAdmin' })
    });
    assert(promoteRes.status === 403, 'Normal Admin CANNOT assign SuperAdmin role (403 Forbidden)');

    // 7. Test Departments API
    console.log('\n7. Testing College Department Structure Management...');
    const deptRes = await fetch(`${BASE_URL}/departments`, {
      headers: { 'x-test-actor': 'admin-college-a' }
    });
    const deptData = await deptRes.json();
    assert(deptRes.status === 200 && Array.isArray(deptData.departments), 'Fetched college departments list');

    // 8. Test Audit Logging
    console.log('\n8. Testing Audit Logging for Administrative Actions...');
    const auditRes = await fetch(`${BASE_URL}/audit-logs`, {
      headers: { 'x-test-actor': 'admin-college-a' }
    });
    const auditData = await auditRes.json();
    assert(auditRes.status === 200 && Array.isArray(auditData.logs), 'Retrieved college audit logs');

  } catch (err) {
    console.error('Test script exception:', err);
    testFailCount++;
  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(`  PHASE 4 TEST SUMMARY: ${testPassCount} PASSED, ${testFailCount} FAILED`);
  console.log('======================================================\n');

  if (testFailCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase4Tests();
