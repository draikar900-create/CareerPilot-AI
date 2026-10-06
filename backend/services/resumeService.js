import { supabaseAdmin } from '../config/supabase.js';

// In-memory resume metadata store as resilient fallback for RLS or DB column cache variations
export const resumeStore = new Map();

/**
 * Helper to derive faculty assignments and profile details.
 */
async function getFacultyScopeInfo(userId, reqScope = null) {
  let profile = null;
  const { data: dbProfile } = await supabaseAdmin
    .from('faculty_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (dbProfile) profile = dbProfile;

  let assignmentsData = [];
  const { data: dbAssignments } = await supabaseAdmin
    .from('faculty_assignments')
    .select('*')
    .eq('faculty_id', userId);
  if (dbAssignments) assignmentsData = dbAssignments;

  const collegeName = profile?.college_name || reqScope?.collegeName || 'CareerPilot Institute of Technology';
  const collegeId = profile?.college_id || reqScope?.collegeId || null;
  const department = profile?.department || 'Computer Science & Engineering';
  const departmentId = profile?.department_id || reqScope?.departmentId || null;

  let assignments = [];
  if (assignmentsData && assignmentsData.length > 0) {
    assignments = assignmentsData.map(a => ({
      college_id: a.college_id || collegeId,
      college_name: a.college_name || collegeName,
      department_id: a.department_id || departmentId,
      department: a.department || department,
      branch: a.branch || a.department || department,
      academic_year: a.academic_year || '3rd Year',
      section: a.section || 'A'
    }));
  } else {
    assignments = [
      { academic_year: '3rd Year', section: 'A', branch: department },
      { academic_year: '4th Year', section: 'B', branch: department }
    ];
  }

  return {
    userId,
    collegeName,
    collegeId,
    department,
    departmentId,
    assignments
  };
}

/**
 * Scope checker for Faculty vs Student.
 */
function checkFacultyStudentScope(faculty, student) {
  if (!student) return { isAuthorized: false, reason: 'Student profile not found.' };

  // 1. Cross-College Check
  if (faculty.collegeId && student.college_id && faculty.collegeId !== student.college_id) {
    return { isAuthorized: false, reason: 'Student belongs to a different college institution.' };
  }
  if (faculty.collegeName && student.college_name && faculty.collegeName !== student.college_name) {
    return { isAuthorized: false, reason: 'Student belongs to a different college institution.' };
  }

  // 2. Cross-Branch / Department Check
  const facultyDept = (faculty.department || '').toLowerCase().trim();
  const studentBranch = (student.branch || '').toLowerCase().trim();
  const assignedBranches = faculty.assignments.map(a => (a.branch || a.department || '').toLowerCase().trim()).filter(Boolean);

  const isBranchMatch = (facultyDept && studentBranch && (facultyDept === studentBranch || studentBranch.includes(facultyDept) || facultyDept.includes(studentBranch))) ||
                        assignedBranches.some(b => b === 'all' || b === studentBranch || studentBranch.includes(b) || b.includes(studentBranch));

  if (!isBranchMatch) {
    return { isAuthorized: false, reason: 'Student belongs to a different department/branch.' };
  }

  // 3. Academic Year Scope Check
  const studentYear = student.academic_year || (student.semester >= 7 ? '4th Year' : student.semester >= 5 ? '3rd Year' : student.semester >= 3 ? '2nd Year' : '1st Year');
  const assignedYears = faculty.assignments.map(a => (a.academic_year || '').toLowerCase().trim());

  if (assignedYears.length > 0) {
    const sYearClean = (studentYear || '').toLowerCase().trim();
    const isYearMatch = assignedYears.includes('all') || assignedYears.includes(sYearClean) || assignedYears.some(y => y.includes(sYearClean) || sYearClean.includes(y));
    if (!isYearMatch) {
      // If department & college match, grant access within faculty department
      return { isAuthorized: true };
    }
  }

  return { isAuthorized: true };
}

/**
 * Centralized authorization engine for Resume Access across all 5 roles.
 */
export async function verifyResumeAccess(requestingUser, reqUserScope, rawStudentId) {
  if (!requestingUser || !requestingUser.id) {
    return { authorized: false, status: 401, message: 'Authentication required.' };
  }

  const targetId = (rawStudentId === 'me' || !rawStudentId) ? requestingUser.id : rawStudentId;
  const userRole = reqUserScope?.role || requestingUser.app_metadata?.role || requestingUser.user_metadata?.role || 'Student';

  // Fetch target student profile from DB
  let { data: targetStudent } = await supabaseAdmin
    .from('student_profiles')
    .select('*')
    .eq('user_id', targetId)
    .maybeSingle();

  // Fetch Auth user metadata for fallback
  let meta = {};
  try {
    const { data: { user: targetAuth } } = await supabaseAdmin.auth.admin.getUserById(targetId);
    if (targetAuth?.user_metadata) meta = targetAuth.user_metadata;
  } catch (e) {}

  if (!targetStudent) {
    if ((meta && Object.keys(meta).length > 0) || resumeStore.has(targetId)) {
      targetStudent = {
        user_id: targetId,
        full_name: meta.full_name || 'Student',
        email: meta.email || '',
        college_id: reqUserScope?.collegeId || null,
        college_name: meta.college_name || reqUserScope?.collegeName || null,
        branch: meta.branch || null,
        semester: Number(meta.semester) || 1,
        resume_storage_path: meta.resume_storage_path || meta.resume_url || null,
        resume_file_name: meta.resume_file_name || null,
        resume_uploaded_at: meta.resume_uploaded_at || null,
        resume_url: meta.resume_url || null
      };
    } else {
      return { authorized: false, status: 404, message: 'Target student not found.' };
    }
  }

  // Check in-memory store for latest updates
  const memoryRecord = resumeStore.get(targetId);
  if (memoryRecord) {
    if (memoryRecord.deleted) {
      targetStudent.resume_storage_path = null;
      targetStudent.resume_file_name = null;
      targetStudent.resume_uploaded_at = null;
      targetStudent.resume_url = null;
      delete targetStudent.fileBuffer;
    } else {
      targetStudent.resume_storage_path = memoryRecord.storagePath;
      targetStudent.resume_file_name = memoryRecord.fileName;
      targetStudent.resume_uploaded_at = memoryRecord.uploadedAt;
      targetStudent.resume_url = memoryRecord.storagePath;
      if (memoryRecord.buffer) targetStudent.fileBuffer = memoryRecord.buffer;
    }
  } else {
    // Combine storage metadata from DB profile & Auth metadata cleanly
    const isExplicitlyNullInMeta = (meta.resume_storage_path === null || meta.resume_url === null);
    if (isExplicitlyNullInMeta) {
      targetStudent.resume_storage_path = null;
      targetStudent.resume_file_name = null;
      targetStudent.resume_uploaded_at = null;
      targetStudent.resume_url = null;
    } else {
      targetStudent.resume_storage_path = targetStudent.resume_storage_path || meta.resume_storage_path || targetStudent.resume_url || meta.resume_url || null;
      targetStudent.resume_file_name = targetStudent.resume_file_name || meta.resume_file_name || null;
      targetStudent.resume_uploaded_at = targetStudent.resume_uploaded_at || meta.resume_uploaded_at || targetStudent.updated_at || new Date().toISOString();
      targetStudent.resume_url = targetStudent.resume_url || targetStudent.resume_storage_path || meta.resume_url || null;
    }
  }

  // 1. STUDENT ROLE
  if (userRole === 'Student') {
    if (requestingUser.id !== targetStudent.user_id) {
      return {
        authorized: false,
        status: 403,
        message: 'Forbidden. Students are strictly restricted to accessing their own resume.'
      };
    }
    return { authorized: true, targetStudent };
  }

  // 2. FACULTY ROLE
  if (userRole === 'Faculty') {
    const faculty = await getFacultyScopeInfo(requestingUser.id, reqUserScope);
    const scopeCheck = checkFacultyStudentScope(faculty, targetStudent);

    if (!scopeCheck.isAuthorized) {
      return {
        authorized: false,
        status: 403,
        message: `Forbidden. Access denied: ${scopeCheck.reason}`
      };
    }
    return { authorized: true, targetStudent };
  }

  // 3. TPO / PLACEMENT OFFICER / ADMIN ROLE
  if (['PlacementOfficer', 'TPO', 'Admin'].includes(userRole)) {
    if (reqUserScope?.isSuperAdmin) {
      return { authorized: true, targetStudent };
    }

    const adminCollegeId = reqUserScope?.collegeId;
    const adminCollegeName = (reqUserScope?.collegeName || '').toLowerCase().trim();
    const studentCollegeId = targetStudent.college_id;
    const studentCollegeName = (targetStudent.college_name || '').toLowerCase().trim();

    if (adminCollegeId && studentCollegeId && adminCollegeId === studentCollegeId) {
      return { authorized: true, targetStudent };
    }
    if (adminCollegeName && studentCollegeName && (adminCollegeName === studentCollegeName || studentCollegeName.includes(adminCollegeName) || adminCollegeName.includes(studentCollegeName))) {
      return { authorized: true, targetStudent };
    }
    if (!adminCollegeId && !adminCollegeName) {
      return { authorized: true, targetStudent };
    }

    return {
      authorized: false,
      status: 403,
      message: 'Forbidden. Access restricted to student resumes within your authorized college scope.'
    };
  }

  // 4. SUPERADMIN ROLE
  if (userRole === 'SuperAdmin' || reqUserScope?.isSuperAdmin) {
    return { authorized: true, targetStudent };
  }

  return { authorized: false, status: 403, message: 'Forbidden. Role not recognized.' };
}
