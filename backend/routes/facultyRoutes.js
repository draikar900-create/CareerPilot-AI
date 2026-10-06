import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser, attachCollegeScope, requireFaculty } from '../middleware/authMiddleware.js';
import { persistentResourceStore, persistentProfileStore } from '../services/persistentStore.js';

const router = express.Router();

/**
 * Helper to derive authoritative faculty profile, qualification details,
 * and scope assignments from Supabase PostgreSQL database or Auth User Metadata.
 */
async function getFacultyDetailsAndAssignments(userId, userMetadata = {}, reqScope = null) {
  let profile = null;
  try {
    const { data: dbProfile, error: pErr } = await supabaseAdmin
      .from('faculty_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (!pErr && dbProfile) {
      profile = dbProfile;
    }
  } catch (err) {
    console.warn('faculty_profiles table lookup notice:', err.message);
  }

  let assignmentsData = [];
  try {
    const { data: dbAssignments, error: aErr } = await supabaseAdmin
      .from('faculty_assignments')
      .select('*')
      .eq('faculty_id', userId);
    if (!aErr && dbAssignments) {
      assignmentsData = dbAssignments;
    }
  } catch (err) {
    console.warn('faculty_assignments table lookup notice:', err.message);
  }

  const email = profile?.email || userMetadata.email || '';
  const fullName = profile?.full_name || userMetadata.full_name || 'Faculty Member';
  const collegeName = profile?.college_name || reqScope?.collegeName || userMetadata.college_name || 'CareerPilot Institute of Technology';
  const collegeId = profile?.college_id || reqScope?.collegeId || null;
  const department = profile?.department || userMetadata.department || 'Computer Science & Engineering';
  const departmentId = profile?.department_id || reqScope?.departmentId || null;
  const designation = profile?.designation || userMetadata.designation || 'Associate Professor';
  const employeeId = profile?.employee_id || userMetadata.employee_id || userMetadata.employeeId || 'FAC-1001';
  const phone = profile?.phone || userMetadata.phone || '';

  const qualification = profile?.qualification || userMetadata.qualification || '';
  const specialization = profile?.specialization || userMetadata.specialization || '';
  const subjectsTaught = profile?.subjects_taught || userMetadata.subjects_taught || [];
  const yearsOfExperience = profile?.years_of_experience || userMetadata.years_of_experience || '';
  const bio = profile?.bio || userMetadata.bio || '';
  const profilePhoto = profile?.profile_photo || userMetadata.profile_photo || userMetadata.avatar_url || '';
  
  const onboardingCompleted = Boolean(
    profile?.onboarding_completed ||
    userMetadata.onboarding_completed ||
    (employeeId && employeeId !== 'FAC-1001' && department)
  );

  let assignments = [];
  if (assignmentsData && Array.isArray(assignmentsData) && assignmentsData.length > 0) {
    assignments = assignmentsData.map(a => ({
      id: a.id,
      college_id: a.college_id || collegeId,
      college_name: a.college_name || collegeName,
      department_id: a.department_id || departmentId,
      department: a.department || department,
      branch: a.branch || a.department || department,
      academic_year: a.academic_year || '3rd Year',
      section: a.section || 'A',
      batch: a.batch || 'All',
      subject: a.subject || 'Computer Science'
    }));
  } else if (userMetadata.assignments && Array.isArray(userMetadata.assignments)) {
    assignments = userMetadata.assignments;
  } else {
    assignments = [
      { academic_year: '3rd Year', section: 'A', branch: department, subject: 'Data Structures & Algorithms' },
      { academic_year: '4th Year', section: 'B', branch: department, subject: 'System Design' }
    ];
  }

  return {
    userId,
    email,
    fullName,
    employeeId,
    phone,
    collegeName,
    collegeId,
    department,
    departmentId,
    designation,
    qualification,
    specialization,
    subjectsTaught,
    yearsOfExperience,
    bio,
    profilePhoto,
    onboardingCompleted,
    assignments
  };
}

/**
 * Helper: Match branch codes and names with aliases (e.g., CSE <-> Computer Science & Engineering)
 */
export function matchBranchAliases(b1, b2) {
  if (!b1 || !b2) return true;
  const norm1 = b1.toLowerCase().trim();
  const norm2 = b2.toLowerCase().trim();
  if (norm1 === 'all' || norm2 === 'all') return true;
  if (norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)) return true;

  const aliases = {
    cse: ['cse', 'cs', 'computer science', 'comp sec', 'computer science & engineering', 'computer science and engineering'],
    ece: ['ece', 'electronics', 'electronics & communication', 'electronics & communication engineering', 'electronics and communication engineering'],
    eee: ['eee', 'electrical', 'electrical & electronics', 'electrical & electronics engineering', 'electrical and electronics engineering'],
    me: ['me', 'mech', 'mechanical', 'mechanical engineering'],
    ce: ['ce', 'civil', 'civil engineering'],
    it: ['it', 'information technology', 'info tech']
  };

  for (const list of Object.values(aliases)) {
    const m1 = list.some(name => norm1 === name || norm1.includes(name));
    const m2 = list.some(name => norm2 === name || norm2.includes(name));
    if (m1 && m2) return true;
  }
  return false;
}

/**
 * Helper: Verify if a student belongs to the authorized teaching scope of a faculty member.
 */
function verifyFacultyStudentScope(faculty, student) {
  if (!student) return { isAuthorized: false, reason: 'Student profile not found.' };

  // 1. Cross-College Check (only enforce if both specify distinct non-matching colleges)
  if (faculty.collegeId && student.college_id && faculty.collegeId !== student.college_id) {
    return { isAuthorized: false, reason: 'Student belongs to a different college institution.' };
  }
  if (faculty.collegeName && student.college_name && faculty.collegeName !== student.college_name) {
    const normFacCol = faculty.collegeName.toLowerCase().trim();
    const normStuCol = student.college_name.toLowerCase().trim();
    if (normFacCol !== normStuCol && !normFacCol.includes('careerpilot') && !normStuCol.includes('careerpilot')) {
      return { isAuthorized: false, reason: 'Student belongs to a different college institution.' };
    }
  }

  // 2. Cross-Branch / Department Check using alias matching
  const facultyDept = (faculty.department || '').toLowerCase().trim();
  const studentBranch = (student.branch || '').toLowerCase().trim();

  const assignedBranches = faculty.assignments.map(a => (a.branch || a.department || '').toLowerCase().trim()).filter(Boolean);
  const isBranchMatch = !studentBranch || !facultyDept ||
                        matchBranchAliases(facultyDept, studentBranch) ||
                        assignedBranches.some(b => b === 'all' || matchBranchAliases(b, studentBranch));

  if (!isBranchMatch) {
    return { isAuthorized: false, reason: 'Student belongs to a different department/branch.' };
  }

  // 3. Academic Year Scope Check
  const studentYear = student.academic_year || (student.semester >= 7 ? '4th Year' : student.semester >= 5 ? '3rd Year' : student.semester >= 3 ? '2nd Year' : '1st Year');
  const assignedYears = faculty.assignments.map(a => a.academic_year);

  if (assignedYears.length > 0 && !assignedYears.includes('All')) {
    const isYearMatch = assignedYears.some(yr => yr === 'All' || yr === studentYear);
    if (!isYearMatch) {
      return { isAuthorized: false, reason: 'Student is outside active academic year teaching assignments.' };
    }
  }

  return { isAuthorized: true };
}

/**
 * Helper: Validate YouTube URL formats safely.
 */
export function normalizeYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const cleaned = url.trim();
  const watchMatch = cleaned.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (watchMatch && watchMatch[1]) {
    const videoId = watchMatch[1];
    return {
      videoId,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };
  }
  return null;
}

/**
 * Helper: Verify if a resource target scope matches faculty's teaching authorization.
 */
export function verifyFacultyResourceScope(faculty, targetScope = {}) {
  const targetBranch = (targetScope.branch || targetScope.department || '').toLowerCase().trim();
  const facultyDept = (faculty.department || '').toLowerCase().trim();
  const assignedBranches = faculty.assignments.map(a => (a.branch || a.department || '').toLowerCase().trim()).filter(Boolean);

  const matchBranch = (b1, b2) => {
    if (!b1 || !b2) return false;
    if (b1 === b2 || b1.includes(b2) || b2.includes(b1)) return true;
    // Common branch code aliases
    const aliases = {
      cse: ['computer science', 'comp sec', 'computer science & engineering'],
      ece: ['electronics', 'electronics & communication', 'electronics & communication engineering'],
      eee: ['electrical', 'electrical & electronics', 'electrical & electronics engineering'],
      me: ['mechanical', 'mechanical engineering'],
      ce: ['civil', 'civil engineering'],
      it: ['information technology', 'info tech']
    };
    for (const [code, names] of Object.entries(aliases)) {
      const b1Match = b1 === code || names.some(n => b1.includes(n));
      const b2Match = b2 === code || names.some(n => b2.includes(n));
      if (b1Match && b2Match) return true;
    }
    return false;
  };

  const isBranchAllowed = !targetBranch ||
                          targetBranch === 'all' ||
                          matchBranch(targetBranch, facultyDept) ||
                          assignedBranches.some(b => b === 'all' || matchBranch(targetBranch, b));

  if (!isBranchAllowed) {
    return {
      isAuthorized: false,
      reason: `Cannot create learning resource for branch '${targetScope.branch || targetScope.department}' outside your department authorization.`
    };
  }

  const targetYear = (targetScope.academic_year || targetScope.academicYear || '').trim();
  const assignedYears = faculty.assignments.map(a => a.academic_year);

  if (targetYear && targetYear !== 'All' && assignedYears.length > 0) {
    const isYearAllowed = assignedYears.includes('All') || assignedYears.includes(targetYear);
    if (!isYearAllowed) {
      return {
        isAuthorized: false,
        reason: `Cannot create learning resource for academic year '${targetYear}' outside your assigned teaching scope.`
      };
    }
  }

  return { isAuthorized: true };
}

// GET /api/faculty/me
router.get('/me', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);
    return res.status(200).json({ success: true, faculty });
  } catch (err) {
    console.error('Error in GET /api/faculty/me:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching faculty profile.' });
  }
});

// POST /api/faculty/onboarding
router.post('/onboarding', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      fullName: fnAlt,
      employee_id,
      employeeId: empAlt,
      college_name,
      collegeName: colAlt,
      college_id,
      collegeId: colIdAlt,
      department,
      department_id,
      designation,
      phone,
      qualification,
      specialization,
      subjects_taught,
      subjectsTaught: subAlt,
      years_of_experience,
      yearsOfExperience: expAlt,
      bio,
      profile_photo,
      profilePhoto: picAlt,
      assignments
    } = req.body;

    const nameVal = (full_name !== undefined ? full_name : (fnAlt !== undefined ? fnAlt : '')).trim();
    const empVal = (employee_id !== undefined ? employee_id : (empAlt !== undefined ? empAlt : '')).trim();
    const colNameVal = (college_name !== undefined ? college_name : (colAlt !== undefined ? colAlt : '')).trim();
    const colIdVal = college_id || colIdAlt || req.userScope?.collegeId || null;
    const deptVal = (department !== undefined ? department : '').trim();
    const desigVal = (designation !== undefined ? designation : '').trim();

    // Strict validation of required fields
    if (!nameVal || !empVal || !colNameVal || !deptVal || !desigVal) {
      return res.status(400).json({
        success: false,
        message: 'Missing required onboarding fields: Full Name, Employee ID, College, Department, and Designation are required.'
      });
    }

    const profileData = {
      user_id: userId,
      full_name: nameVal,
      employee_id: empVal,
      email: req.user.email,
      college_name: colNameVal,
      college_id: colIdVal,
      department: deptVal,
      department_id: department_id || req.userScope?.departmentId || null,
      designation: desigVal,
      phone: (phone || '').trim(),
      qualification: (qualification || '').trim(),
      specialization: (specialization || '').trim(),
      subjects_taught: Array.isArray(subjects_taught || subAlt) ? (subjects_taught || subAlt) : [],
      years_of_experience: (years_of_experience || expAlt || '').toString().trim(),
      bio: (bio || '').trim(),
      profile_photo: profile_photo || picAlt || '',
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    };

    try {
      await supabaseAdmin
        .from('faculty_profiles')
        .upsert(profileData, { onConflict: 'user_id' });
    } catch (upsertErr) {
      console.warn('faculty_profiles table upsert notice:', upsertErr.message);
    }

    if (Array.isArray(assignments)) {
      try {
        await supabaseAdmin.from('faculty_assignments').delete().eq('faculty_id', userId);

        if (assignments.length > 0) {
          const rows = assignments.map(a => ({
            faculty_id: userId,
            college_id: profileData.college_id,
            college_name: profileData.college_name,
            department_id: profileData.department_id,
            department: profileData.department,
            branch: a.branch || profileData.department,
            academic_year: a.academic_year || '3rd Year',
            section: a.section || 'A',
            batch: a.batch || 'All',
            subject: a.subject || 'Computer Science'
          }));

          await supabaseAdmin.from('faculty_assignments').insert(rows);
        }
      } catch (aErr) {
        console.warn('faculty_assignments save notice:', aErr.message);
      }
    }

    const updatedMeta = {
      ...req.user.user_metadata,
      full_name: profileData.full_name,
      employee_id: profileData.employee_id,
      college_name: profileData.college_name,
      department: profileData.department,
      designation: profileData.designation,
      phone: profileData.phone,
      qualification: profileData.qualification,
      specialization: profileData.specialization,
      bio: profileData.bio,
      years_of_experience: profileData.years_of_experience,
      subjects_taught: profileData.subjects_taught,
      onboarding_completed: true,
      assignments: Array.isArray(assignments) ? assignments : req.user.user_metadata?.assignments
    };

    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: updatedMeta });
    } catch (metaErr) {
      console.warn('Auth user_metadata sync notice:', metaErr.message);
    }

    const updatedFaculty = await getFacultyDetailsAndAssignments(userId, updatedMeta, req.userScope);

    return res.status(200).json({
      success: true,
      message: 'Faculty onboarding completed successfully.',
      faculty: updatedFaculty
    });
  } catch (err) {
    console.error('Error in POST /api/faculty/onboarding:', err);
    return res.status(500).json({ success: false, message: 'Failed to save faculty profile onboarding.' });
  }
});

// PUT /api/faculty/profile
router.put('/profile', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      qualification,
      specialization,
      subjects_taught,
      years_of_experience,
      bio,
      profile_photo,
      designation
    } = req.body;

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (qualification !== undefined) updates.qualification = qualification.trim();
    if (specialization !== undefined) updates.specialization = specialization.trim();
    if (subjects_taught !== undefined) updates.subjects_taught = Array.isArray(subjects_taught) ? subjects_taught : [];
    if (years_of_experience !== undefined) updates.years_of_experience = String(years_of_experience).trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (profile_photo !== undefined) updates.profile_photo = profile_photo.trim();
    if (designation !== undefined) updates.designation = designation.trim();

    try {
      await supabaseAdmin
        .from('faculty_profiles')
        .update(updates)
        .eq('user_id', userId);
    } catch (dbErr) {
      console.warn('faculty_profiles update notice:', dbErr.message);
    }

    const updatedMeta = {
      ...req.user.user_metadata,
      ...updates
    };

    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, { user_metadata: updatedMeta });
    } catch (metaErr) {
      console.warn('Auth user_metadata sync notice:', metaErr.message);
    }

    const updatedFaculty = await getFacultyDetailsAndAssignments(userId, updatedMeta, req.userScope);

    return res.status(200).json({
      success: true,
      message: 'Faculty profile updated successfully.',
      faculty: updatedFaculty
    });
  } catch (err) {
    console.error('Error in PUT /api/faculty/profile:', err);
    return res.status(500).json({ success: false, message: 'Failed to update faculty profile.' });
  }
});

// GET /api/faculty/dashboard
router.get('/dashboard', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    if (!faculty.collegeName && !faculty.collegeId) {
      return res.status(200).json({
        success: true,
        dashboard: {
          facultyInfo: faculty,
          metrics: {
            totalAssignedStudents: 0,
            avgReadinessScore: 0,
            assessmentCompletionRate: 0,
            rankDistribution: { Platinum: 0, Gold: 0, Silver: 0, Unranked: 0 },
            studentsByYear: { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 }
          },
          upcomingClasses: [],
          message: 'No student data available for your current teaching scope.'
        }
      });
    }

    const { data: dbStudents, error: queryErr } = await supabaseAdmin.from('student_profiles').select('*');
    if (queryErr) {
      console.warn('Faculty dashboard student query notice:', queryErr.message);
    }

    const persistentStudents = persistentProfileStore.getAll();
    const existingUserIds = new Set((dbStudents || []).map(s => s.user_id));
    const mergedRawStudents = [...(dbStudents || [])];

    for (const ps of persistentStudents) {
      if (!existingUserIds.has(ps.user_id)) {
        mergedRawStudents.push(ps);
      }
    }

    const students = mergedRawStudents.filter(s => verifyFacultyStudentScope(faculty, s).isAuthorized);

    const assignedYears = faculty.assignments.map(a => a.academic_year);
    const assignedStudents = students.filter(s => {
      const yr = s.academic_year || (s.semester >= 7 ? '4th Year' : s.semester >= 5 ? '3rd Year' : s.semester >= 3 ? '2nd Year' : '1st Year');
      return !assignedYears.length || assignedYears.includes('All') || assignedYears.includes(yr);
    });

    if (assignedStudents.length === 0) {
      return res.status(200).json({
        success: true,
        dashboard: {
          facultyInfo: faculty,
          metrics: {
            totalAssignedStudents: 0,
            avgReadinessScore: 0,
            assessmentCompletionRate: 0,
            rankDistribution: { Platinum: 0, Gold: 0, Silver: 0, Unranked: 0 },
            studentsByYear: { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 }
          },
          upcomingClasses: [],
          message: 'No student data available for your current teaching scope.'
        }
      });
    }

    const studentUserIds = assignedStudents.map(s => s.user_id);
    let attempts = [];
    if (studentUserIds.length > 0) {
      const { data: attemptData } = await supabaseAdmin
        .from('readiness_attempts')
        .select('*')
        .in('user_id', studentUserIds);
      attempts = attemptData || [];
    }

    const studentAttemptsMap = {};
    attempts.forEach(a => {
      if (a.category && a.category.includes('SUBMITTED')) {
        if (!studentAttemptsMap[a.user_id] || new Date(a.created_at) > new Date(studentAttemptsMap[a.user_id].created_at)) {
          studentAttemptsMap[a.user_id] = a;
        }
      }
    });

    const rankCounts = { Platinum: 0, Gold: 0, Silver: 0, Unranked: 0 };
    let totalScoreSum = 0;
    let scoredCount = 0;

    assignedStudents.forEach(s => {
      const att = studentAttemptsMap[s.user_id];
      if (att) {
        const parts = att.category.split(' | ');
        const rank = parts[1] || (att.score >= 85 ? 'Platinum' : att.score >= 70 ? 'Gold' : 'Silver');
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
        totalScoreSum += Number(att.score) || 0;
        scoredCount++;
      } else {
        rankCounts.Unranked++;
      }
    });

    const yearCounts = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0 };
    assignedStudents.forEach(s => {
      const yr = s.academic_year || (s.semester >= 7 ? '4th Year' : s.semester >= 5 ? '3rd Year' : s.semester >= 3 ? '2nd Year' : '1st Year');
      yearCounts[yr] = (yearCounts[yr] || 0) + 1;
    });

    const avgScore = scoredCount > 0 ? Math.round(totalScoreSum / scoredCount) : 0;

    let realClasses = [];
    try {
      const { data: dbClasses } = await supabaseAdmin
        .from('faculty_classes')
        .select('*')
        .eq('faculty_id', req.user.id)
        .order('class_date', { ascending: true });
      if (dbClasses) realClasses = dbClasses;
    } catch (cErr) {
      console.warn('faculty_classes query notice:', cErr.message);
    }

    return res.status(200).json({
      success: true,
      dashboard: {
        facultyInfo: faculty,
        metrics: {
          totalAssignedStudents: assignedStudents.length,
          avgReadinessScore: avgScore,
          assessmentCompletionRate: assignedStudents.length > 0 ? Math.round((scoredCount / assignedStudents.length) * 100) : 0,
          rankDistribution: rankCounts,
          studentsByYear: yearCounts
        },
        upcomingClasses: realClasses
      }
    });
  } catch (err) {
    console.error('Error in GET /api/faculty/dashboard:', err);
    return res.status(500).json({ success: false, message: 'Server error loading faculty dashboard.' });
  }
});

// GET /api/faculty/students
router.get('/students', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);
    const { academic_year, section, rank, search } = req.query;

    if (!faculty.collegeName && !faculty.collegeId) {
      return res.status(200).json({ success: true, totalCount: 0, students: [] });
    }

    const { data: dbStudents, error: queryErr } = await supabaseAdmin.from('student_profiles').select('*');
    if (queryErr) {
      console.warn('Error fetching student profiles:', queryErr.message);
    }

    const persistentStudents = persistentProfileStore.getAll();
    const existingUserIds = new Set((dbStudents || []).map(s => s.user_id));
    const mergedRawStudents = [...(dbStudents || [])];

    for (const ps of persistentStudents) {
      if (!existingUserIds.has(ps.user_id)) {
        mergedRawStudents.push(ps);
      }
    }

    const studentsList = mergedRawStudents.filter(s => verifyFacultyStudentScope(faculty, s).isAuthorized);

    const studentUserIds = studentsList.map(s => s.user_id);
    let attempts = [];
    if (studentUserIds.length > 0) {
      const { data: attemptData } = await supabaseAdmin.from('readiness_attempts').select('*').in('user_id', studentUserIds);
      attempts = attemptData || [];
    }

    const latestAttempts = {};
    attempts.forEach(a => {
      if (a.category && a.category.includes('SUBMITTED')) {
        if (!latestAttempts[a.user_id] || new Date(a.created_at) > new Date(latestAttempts[a.user_id].created_at)) {
          latestAttempts[a.user_id] = a;
        }
      }
    });

    const assignedYears = faculty.assignments.map(a => a.academic_year);

    let filtered = studentsList.filter(s => {
      const yr = s.academic_year || (s.semester >= 7 ? '4th Year' : s.semester >= 5 ? '3rd Year' : s.semester >= 3 ? '2nd Year' : '1st Year');
      
      if (assignedYears.length > 0 && !assignedYears.includes('All') && !assignedYears.includes(yr)) {
        return false;
      }

      if (academic_year && yr !== academic_year) return false;
      if (section && s.section && s.section !== section) return false;

      const att = latestAttempts[s.user_id];
      const studentRank = att ? (att.category.split(' | ')[1] || (att.score >= 85 ? 'Platinum' : att.score >= 70 ? 'Gold' : 'Silver')) : 'Unranked';

      if (rank && studentRank !== rank) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchName = (s.full_name || '').toLowerCase().includes(q);
        const matchEmail = (s.email || '').toLowerCase().includes(q);
        const matchBranch = (s.branch || '').toLowerCase().includes(q);
        const matchId = (s.user_id || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchBranch && !matchId) return false;
      }

      return true;
    });

    const decorated = filtered.map(s => {
      const att = latestAttempts[s.user_id];
      const score = att ? Number(att.score) || 0 : 0;
      const studentRank = att ? (att.category.split(' | ')[1] || (score >= 85 ? 'Platinum' : score >= 70 ? 'Gold' : 'Silver')) : 'Unranked';
      const yr = s.academic_year || (s.semester >= 7 ? '4th Year' : s.semester >= 5 ? '3rd Year' : s.semester >= 3 ? '2nd Year' : '1st Year');

      return {
        id: s.user_id,
        fullName: s.full_name || 'Student',
        email: s.email,
        phone: s.phone || '',
        studentId: s.user_id ? s.user_id.substring(0, 8).toUpperCase() : 'STU-1001',
        branch: s.branch || faculty.department || 'Computer Science',
        academicYear: yr,
        section: s.section || 'A',
        batch: s.batch || '2023-2027',
        collegeName: s.college_name || faculty.collegeName,
        cgpa: s.cgpa || null,
        semester: s.semester || null,
        technicalSkills: s.technical_skills || [],
        readinessScore: score,
        rank: studentRank,
        onboardingCompleted: s.onboarding_completed || false,
        createdAt: s.created_at
      };
    });

    return res.status(200).json({
      success: true,
      totalCount: decorated.length,
      students: decorated
    });
  } catch (err) {
    console.error('Error in GET /api/faculty/students:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch assigned students.' });
  }
});

// GET /api/faculty/students/:studentId
router.get('/students/:studentId', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { studentId } = req.params;
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    let { data: student, error } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    if (!student) {
      student = persistentProfileStore.getById(studentId);
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const scopeCheck = verifyFacultyStudentScope(faculty, student);
    if (!scopeCheck.isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access denied: ${scopeCheck.reason}`
      });
    }

    const [{ data: attempts }, { data: goal }, { data: projects }, { data: certificates }] = await Promise.all([
      supabaseAdmin.from('readiness_attempts').select('*').eq('user_id', studentId).order('created_at', { ascending: false }),
      supabaseAdmin.from('career_goals').select('*').eq('user_id', studentId).maybeSingle(),
      supabaseAdmin.from('saved_projects').select('*, projects(*)').eq('user_id', studentId),
      supabaseAdmin.from('saved_certificates').select('*, certificates(*)').eq('user_id', studentId)
    ]);

    const latestAttempt = (attempts || []).find(a => a.category && a.category.includes('SUBMITTED'));
    const score = latestAttempt ? Number(latestAttempt.score) || 0 : 0;
    const rank = latestAttempt ? (latestAttempt.category.split(' | ')[1] || (score >= 85 ? 'Platinum' : score >= 70 ? 'Gold' : 'Silver')) : 'Unranked';
    const yr = student.academic_year || (student.semester >= 7 ? '4th Year' : student.semester >= 5 ? '3rd Year' : student.semester >= 3 ? '2nd Year' : '1st Year');

    const domainPerf = {
      Aptitude: latestAttempt ? Math.round(score * 0.9) : 0,
      Technical: latestAttempt ? Math.round(score * 0.95) : 0,
      Communication: latestAttempt ? Math.round(score * 0.85) : 0,
      ProblemSolving: score
    };

    const detail = {
      id: student.user_id,
      fullName: student.full_name || 'Student',
      email: student.email,
      phone: student.phone || 'Not provided',
      studentId: student.user_id ? student.user_id.substring(0, 8).toUpperCase() : 'STU-1001',
      branch: student.branch || 'Computer Science',
      academicYear: yr,
      section: student.section || 'A',
      batch: student.batch || '2023-2027',
      collegeName: student.college_name || faculty.collegeName,
      cgpa: student.cgpa ? Number(student.cgpa) : null,
      semester: student.semester ? Number(student.semester) : null,
      graduationYear: student.graduation_year || null,
      technicalSkills: student.technical_skills || [],
      achievements: student.achievements || [],
      githubUrl: student.github_url || null,
      linkedinUrl: student.linkedin_url || null,
      resumeUrl: student.resume_url || null,
      targetRole: goal?.target_role || null,
      targetCompany: goal?.target_company || null,
      focusSkills: goal?.focus_skills || [],
      readinessScore: score,
      rank,
      domainPerformance: domainPerf,
      projects: (projects || []).map(p => p.projects?.title || p.custom_project_data?.title).filter(Boolean),
      certificates: (certificates || []).map(c => c.certificates?.title).filter(Boolean),
      attemptsCount: (attempts || []).length
    };

    return res.status(200).json({
      success: true,
      studentDetail: detail
    });
  } catch (err) {
    console.error('Error in GET /api/faculty/students/:studentId:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
  }
});

// GET /api/faculty/students/:studentId/roadmap
router.get('/students/:studentId/roadmap', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { studentId } = req.params;
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    const { data: student, error } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    if (error || !student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const scopeCheck = verifyFacultyStudentScope(faculty, student);
    if (!scopeCheck.isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access denied: ${scopeCheck.reason}`
      });
    }

    const { data: roadmap } = await supabaseAdmin
      .from('roadmaps')
      .select('*, roadmap_topics(*)')
      .eq('user_id', studentId)
      .maybeSingle();

    let structured_data = null;
    if (roadmap?.description && roadmap.description.trim().startsWith('{')) {
      try {
        structured_data = JSON.parse(roadmap.description);
      } catch (e) {}
    }

    const formattedRoadmap = roadmap ? {
      ...roadmap,
      structured_data: structured_data || roadmap.structured_data
    } : null;

    return res.status(200).json({
      success: true,
      roadmap: formattedRoadmap
    });
  } catch (err) {
    console.error('Error in GET /api/faculty/students/:studentId/roadmap:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student roadmap.' });
  }
});

// GET /api/faculty/students/:studentId/resume
// Returns authorized student's resume URL securely
router.get('/students/:studentId/resume', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { studentId } = req.params;
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    const { data: student } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id, college_name, college_id, branch, semester, resume_url')
      .eq('user_id', studentId)
      .maybeSingle();

    const targetStudent = student || {
      user_id: studentId,
      college_id: faculty.collegeId,
      college_name: faculty.collegeName,
      branch: faculty.department,
      semester: 5
    };

    const scopeCheck = verifyFacultyStudentScope(faculty, targetStudent);
    if (!scopeCheck.isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access denied: ${scopeCheck.reason}`
      });
    }

    if (!targetStudent.resume_url) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'No resume document uploaded by this student.'
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      resumeUrl: targetStudent.resume_url
    });
  } catch (err) {
    console.error('Error in GET /api/faculty/students/:studentId/resume:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student resume document.' });
  }
});

// GET /api/faculty/students/:studentId/notes
// Returns private faculty notes & feedback for authorized student
router.get('/students/:studentId/notes', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { studentId } = req.params;
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    const { data: student } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    const targetStudent = student || {
      user_id: studentId,
      college_id: faculty.collegeId,
      college_name: faculty.collegeName,
      branch: faculty.department,
      semester: 5
    };

    const scopeCheck = verifyFacultyStudentScope(faculty, targetStudent);
    if (!scopeCheck.isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access denied: ${scopeCheck.reason}`
      });
    }

    let notes = [];
    try {
      const { data: notesData } = await supabaseAdmin
        .from('faculty_student_notes')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      if (notesData) notes = notesData;
    } catch (dbErr) {
      console.warn('faculty_student_notes query notice:', dbErr.message);
    }

    return res.status(200).json({ success: true, notes });
  } catch (err) {
    console.error('Error in GET /api/faculty/students/:studentId/notes:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student notes.' });
  }
});

// GET /api/faculty/my-notes
// Returns all faculty notes and progress observations for the currently authenticated student
router.get('/my-notes', authenticateUser, attachCollegeScope, async (req, res) => {
  try {
    const studentId = req.user.id;
    const studentEmail = req.user.email;
    let notes = [];

    // Primary: Query Supabase notifications database table for faculty notes
    try {
      const { data: dbNotifs } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${studentId},type.eq.faculty_note`)
        .order('created_at', { ascending: false });

      if (dbNotifs && dbNotifs.length > 0) {
        for (const n of dbNotifs) {
          if (n.type === 'faculty_note' || (n.title && n.title.includes('Faculty Note'))) {
            notes.push({
              id: n.id,
              student_id: n.user_id || studentId,
              faculty_id: n.faculty_id || 'faculty-author',
              faculty_name: n.faculty_name || (n.title ? n.title.replace('Faculty Note from ', '') : 'Faculty Mentor'),
              category: n.category || 'Academic Observation & Guidance',
              note_text: n.message || n.note_text || '',
              created_at: n.created_at || new Date().toISOString()
            });
          }
        }
      }
    } catch (dbErr) {
      console.warn('notifications query notice:', dbErr.message);
    }

    // Secondary: Check persistentNotificationStore for fallback
    const persistentNotifs = persistentNotificationStore.getAll();
    const existingIds = new Set(notes.map(n => n.id));

    for (const pn of persistentNotifs) {
      if ((pn.student_id === studentId || pn.target_user_id === studentId || pn.student_email === studentEmail) && !existingIds.has(pn.id)) {
        notes.push({
          id: pn.id,
          student_id: studentId,
          faculty_id: pn.faculty_id || 'faculty-author',
          faculty_name: pn.faculty_name || pn.sender_name || 'Faculty Mentor',
          category: pn.category || 'Academic Progress & Guidance',
          note_text: pn.note_text || pn.message || pn.note || '',
          created_at: pn.created_at || new Date().toISOString()
        });
      }
    }

    notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.status(200).json({ success: true, notes });
  } catch (err) {
    console.error('Error in GET /api/faculty/my-notes:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch student notes.' });
  }
});

// POST /api/faculty/students/:studentId/notes
// Adds private faculty feedback/observation for authorized student
router.post('/students/:studentId/notes', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { note_text, note, category, is_private, isPrivate } = req.body;
    const finalNoteText = note || note_text;

    if (!finalNoteText || !finalNoteText.trim()) {
      return res.status(400).json({ success: false, message: 'Note text content is required.' });
    }

    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    const { data: student } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    const targetStudent = student || {
      user_id: studentId,
      college_id: faculty.collegeId,
      college_name: faculty.collegeName,
      branch: faculty.department,
      semester: 5
    };

    const scopeCheck = verifyFacultyStudentScope(faculty, targetStudent);
    if (!scopeCheck.isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access denied: ${scopeCheck.reason}`
      });
    }

    const noteRecord = {
      user_id: studentId,
      title: `Faculty Note from ${faculty.fullName || 'Faculty Mentor'}`,
      message: finalNoteText.trim(),
      type: 'faculty_note',
      category: category || 'Academic Observation & Guidance',
      created_at: new Date().toISOString()
    };

    let createdNote = null;

    // Primary: Insert into Supabase notifications table
    try {
      const { data: inserted } = await supabaseAdmin
        .from('notifications')
        .insert(noteRecord)
        .select('*')
        .maybeSingle();
      createdNote = inserted;
    } catch (dbErr) {
      console.warn('notifications table insert notice:', dbErr.message);
    }

    // Backup to persistentNotificationStore
    try {
      persistentNotificationStore.save({
        id: createdNote?.id || 'note-' + Date.now(),
        type: 'faculty_note',
        student_id: studentId,
        student_email: targetStudent.email || '',
        target_user_id: studentId,
        faculty_id: req.user.id,
        faculty_name: faculty.fullName || 'Faculty Mentor',
        sender_name: faculty.fullName || 'Faculty Mentor',
        title: `Faculty Note from ${faculty.fullName || 'Faculty Mentor'}`,
        category: category || 'Academic Observation & Guidance',
        message: finalNoteText.trim(),
        note_text: finalNoteText.trim(),
        created_at: new Date().toISOString()
      });
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Faculty feedback recorded successfully.',
      note: createdNote || { ...noteRecord, id: 'note-' + Date.now(), faculty_name: faculty.fullName || 'Faculty Mentor', note_text: finalNoteText.trim() }
    });
  } catch (err) {
    console.error('Error in POST /api/faculty/students/:studentId/notes:', err);
    return res.status(500).json({ success: false, message: 'Failed to record student note.' });
  }
});

// DELETE /api/faculty/students/:studentId/notes/:noteId
router.delete('/students/:studentId/notes/:noteId', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { noteId } = req.params;
    try {
      await supabaseAdmin
        .from('faculty_student_notes')
        .delete()
        .eq('id', noteId)
        .eq('faculty_id', req.user.id);
    } catch (dbErr) {
      console.warn('faculty_student_notes delete notice:', dbErr.message);
    }

    return res.status(200).json({ success: true, message: 'Faculty note removed successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete note.' });
  }
});

// GET /api/faculty/resources
// Returns faculty learning resources with scope authorization
router.get('/resources', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    let query = supabaseAdmin.from('resources').select('*');
    const { data: rawResources, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching faculty resources from DB:', error.message);
    }

    const dbProcessed = (rawResources || []).map(r => {
      let meta = {};
      try {
        if (r.description && r.description.startsWith('{')) {
          meta = JSON.parse(r.description);
        }
      } catch (e) {}

      const descText = meta.desc !== undefined ? meta.desc : r.description || '';
      const resourceType = meta.type || (r.url && (r.url.includes('youtube') || r.url.includes('youtu.be')) ? 'youtube' : 'notes');

      return {
        id: r.id,
        title: r.title,
        category: r.category,
        description: descText,
        url: r.url,
        type: resourceType,
        branch: meta.branch || 'CSE',
        academicYear: meta.academic_year || meta.academicYear || '3rd Year',
        academic_year: meta.academic_year || meta.academicYear || '3rd Year',
        section: meta.section || 'All',
        subject: meta.subject || 'Computer Science',
        topic: meta.topic || '',
        author: meta.author || faculty.fullName,
        created_by: meta.created_by || r.created_by || req.user.id,
        createdAt: r.created_at,
        created_at: r.created_at
      };
    });

    const persistentList = persistentResourceStore.getAll();
    const existingIds = new Set(dbProcessed.map(p => p.id));
    const merged = [...dbProcessed];

    for (const p of persistentList) {
      if (!existingIds.has(p.id)) {
        merged.unshift(p);
      }
    }

    return res.status(200).json({
      success: true,
      resources: merged
    });
  } catch (err) {
    console.error('Error in GET /api/faculty/resources:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch faculty resources.' });
  }
});

// POST /api/faculty/resources
// Adds faculty study material or YouTube learning resource with scope validation & URL normalization
router.post('/resources', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);
    const {
      title,
      description,
      url,
      category,
      type,
      branch,
      academic_year,
      section,
      subject,
      topic
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Resource title is required.' });
    }
    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, message: 'Resource URL is required.' });
    }

    const targetBranch = branch || faculty.department || 'Computer Science & Engineering';
    const targetYear = academic_year || req.body.academicYear || '3rd Year';

    // SERVER-SIDE RESOURCE SCOPE AUTHORIZATION CHECK
    const scopeCheck = verifyFacultyResourceScope(faculty, {
      branch: targetBranch,
      academic_year: targetYear,
      college_name: faculty.collegeName
    });

    if (!scopeCheck.isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. ${scopeCheck.reason}`
      });
    }

    let finalUrl = url.trim();
    let resourceType = type || 'notes';

    // Handle YouTube Video links with regex validation & normalization
    if (resourceType === 'youtube' || resourceType === 'video' || finalUrl.includes('youtube.com') || finalUrl.includes('youtu.be')) {
      const ytInfo = normalizeYouTubeUrl(finalUrl);
      if (!ytInfo) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL. Please provide a standard YouTube video link (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...)'
        });
      }
      finalUrl = ytInfo.watchUrl;
      resourceType = 'youtube';
    }

    const metadataObj = {
      desc: (description || '').trim(),
      type: resourceType,
      branch: targetBranch,
      academic_year: targetYear,
      academicYear: targetYear,
      section: section || 'All',
      subject: subject || 'Computer Science',
      topic: topic || '',
      created_by: req.user.id,
      author: faculty.fullName,
      college_id: faculty.collegeId,
      department_id: faculty.departmentId
    };

    const newResource = {
      title: title.trim(),
      category: category || (resourceType === 'youtube' ? 'YouTube Lectures' : 'Faculty Notes'),
      description: JSON.stringify(metadataObj),
      url: finalUrl,
      is_free: true,
      created_at: new Date().toISOString()
    };

    const { data: inserted, error: dbErr } = await supabaseAdmin
      .from('resources')
      .insert(newResource)
      .select('*')
      .maybeSingle();

    const resourceId = inserted?.id || ('res-' + Date.now());
    const createdAt = inserted?.created_at || newResource.created_at;

    const resObj = {
      id: resourceId,
      title: title.trim(),
      category: category || (resourceType === 'youtube' ? 'YouTube Lectures' : 'Faculty Notes'),
      description: (description || '').trim(),
      url: finalUrl,
      type: resourceType,
      branch: targetBranch,
      academicYear: targetYear,
      academic_year: targetYear,
      section: section || 'All',
      subject: subject || 'Computer Science',
      topic: topic || '',
      author: faculty.fullName,
      created_by: req.user.id,
      createdAt: createdAt,
      created_at: createdAt
    };

    if (dbErr) {
      console.warn('Notice: Supabase DB resources table insert:', dbErr.message);
    }

    // Persist to local disk store so resource is guaranteed available across restarts and RLS boundaries
    persistentResourceStore.save(resObj);

    // Deliver notification to students in target class scope if notification table exists
    try {
      await supabaseAdmin.from('notifications').insert([{
        title: `New Learning Resource: ${title.trim()}`,
        message: `Faculty ${faculty.fullName} published a new ${resourceType === 'youtube' ? 'YouTube Lecture' : 'Study Note'} for ${targetBranch} (${targetYear}).`,
        type: 'resource',
        category: 'academic',
        created_at: new Date().toISOString()
      }]);
    } catch (nErr) {
      console.warn('Notification delivery notice:', nErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Faculty learning resource published successfully.',
      resource: resObj
    });
  } catch (err) {
    console.error('Error in POST /api/faculty/resources:', err);
    return res.status(500).json({ success: false, message: 'Failed to publish faculty resource.' });
  }
});

// PUT /api/faculty/resources/:id
router.put('/resources/:id', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    let targetRes = null;
    const { data: dbResource } = await supabaseAdmin
      .from('resources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (dbResource) {
      targetRes = dbResource;
    } else {
      const pList = persistentResourceStore.getAll();
      const pFound = pList.find(r => r.id === id);
      if (pFound) {
        targetRes = {
          id: pFound.id,
          title: pFound.title,
          url: pFound.url,
          category: pFound.category || 'Faculty Notes',
          description: typeof pFound.description === 'string' && pFound.description.startsWith('{')
            ? pFound.description
            : JSON.stringify({
                desc: pFound.description || '',
                type: pFound.type || 'notes',
                branch: pFound.branch || 'CSE',
                academic_year: pFound.academic_year || pFound.academicYear || '3rd Year',
                author: pFound.author || faculty.fullName
              })
        };
      }
    }

    if (!targetRes) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const { title, description, url, branch, academic_year } = req.body;
    if (branch || academic_year) {
      const scopeCheck = verifyFacultyResourceScope(faculty, { branch, academic_year });
      if (!scopeCheck.isAuthorized) {
        return res.status(403).json({ success: false, message: `Forbidden. ${scopeCheck.reason}` });
      }
    }

    let meta = {};
    try {
      if (targetRes.description && targetRes.description.startsWith('{')) {
        meta = JSON.parse(targetRes.description);
      }
    } catch (e) {}

    if (description !== undefined) meta.desc = description.trim();
    if (branch) meta.branch = branch;
    if (academic_year || req.body.academicYear) {
      meta.academic_year = academic_year || req.body.academicYear;
      meta.academicYear = meta.academic_year;
    }
    if (url) {
      const ytInfo = normalizeYouTubeUrl(url);
      targetRes.url = ytInfo ? ytInfo.watchUrl : url.trim();
      if (ytInfo) meta.type = 'youtube';
    }

    const updates = {
      title: title ? title.trim() : targetRes.title,
      url: url ? (normalizeYouTubeUrl(url)?.watchUrl || url.trim()) : targetRes.url,
      description: JSON.stringify(meta)
    };

    await supabaseAdmin
      .from('resources')
      .update(updates)
      .eq('id', id);

    const resObj = {
      id,
      title: updates.title,
      category: targetRes.category || 'Faculty Notes',
      description: meta.desc || description || '',
      url: updates.url,
      type: meta.type || 'notes',
      branch: meta.branch || 'CSE',
      academicYear: meta.academic_year || '3rd Year',
      academic_year: meta.academic_year || '3rd Year',
      author: meta.author || faculty.fullName
    };

    persistentResourceStore.save(resObj);

    return res.status(200).json({
      success: true,
      message: 'Resource updated successfully.',
      resource: resObj
    });
  } catch (err) {
    console.error('Error in PUT /api/faculty/resources/:id:', err);
    return res.status(500).json({ success: false, message: 'Failed to update resource.' });
  }
});

// DELETE /api/faculty/resources/:id
router.delete('/resources/:id', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;

    await supabaseAdmin
      .from('resources')
      .delete()
      .eq('id', id);

    persistentResourceStore.delete(id);

    return res.status(200).json({ success: true, message: 'Faculty resource deleted successfully.' });
  } catch (err) {
    persistentResourceStore.delete(req.params.id);
    return res.status(200).json({ success: true, message: 'Faculty resource deleted successfully.' });
  }
});

// GET /api/faculty/classes
router.get('/classes', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { data: classes } = await supabaseAdmin
      .from('faculty_classes')
      .select('*')
      .eq('faculty_id', req.user.id)
      .order('created_at', { ascending: false });

    return res.status(200).json({ success: true, classes: classes || [] });
  } catch (err) {
    return res.status(200).json({ success: true, classes: [] });
  }
});

// POST /api/faculty/classes
router.post('/classes', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { title, subject, topic, description, academic_year, section, schedule_time, meeting_url } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Class title is required.' });

    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    const newClass = {
      faculty_id: req.user.id,
      college_id: faculty.collegeId,
      department_id: faculty.departmentId,
      title: title.trim(),
      subject: subject || 'Computer Science',
      topic: topic || '',
      description: (description || '').trim(),
      department: faculty.department || 'Computer Science & Engineering',
      academic_year: academic_year || '3rd Year',
      section: section || 'A',
      class_date: schedule_time || new Date().toISOString(),
      meeting_url: meeting_url || '',
      status: 'Scheduled',
      created_at: new Date().toISOString()
    };

    let createdClass = null;
    try {
      const { data: inserted } = await supabaseAdmin
        .from('faculty_classes')
        .insert(newClass)
        .select('*')
        .maybeSingle();
      createdClass = inserted;
    } catch (cErr) {
      console.warn('faculty_classes insert notice:', cErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Training class scheduled successfully.',
      class: createdClass || { ...newClass, id: 'class-' + Date.now() }
    });
  } catch (err) {
    console.error('Error in POST /api/faculty/classes:', err);
    return res.status(500).json({ success: false, message: 'Failed to schedule class.' });
  }
});

// DELETE /api/faculty/classes/:id
router.delete('/classes/:id', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseAdmin
      .from('faculty_classes')
      .delete()
      .eq('id', id)
      .eq('faculty_id', req.user.id);

    return res.status(200).json({ success: true, message: 'Scheduled class deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete class.' });
  }
});

// POST /api/faculty/feedback
// Allows faculty to submit persisted feedback for an authorized student
router.post('/feedback', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { student_id, studentId: altStudentId, category, content, rating } = req.body;
    const targetStudentId = student_id || altStudentId;

    if (!targetStudentId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Student ID and feedback content are required.' });
    }

    const faculty = await getFacultyDetailsAndAssignments(facultyId, req.user.user_metadata, req.userScope);

    // Verify target student belongs to faculty's authorized scope
    const { data: student } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', targetStudentId)
      .maybeSingle();

    if (student) {
      const scopeCheck = verifyFacultyStudentScope(faculty, student);
      if (!scopeCheck.isAuthorized) {
        return res.status(403).json({ success: false, message: `Forbidden. Cannot submit feedback: ${scopeCheck.reason}` });
      }
    }

    const feedbackRecord = {
      faculty_id: facultyId,
      student_id: targetStudentId,
      category: category || 'Academic Guidance',
      content: content.trim(),
      rating: Number(rating) || 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let savedFeedback = null;
    try {
      const { data: inserted } = await supabaseAdmin
        .from('faculty_feedback')
        .insert(feedbackRecord)
        .select('*')
        .maybeSingle();
      savedFeedback = inserted;
    } catch (dbErr) {
      console.warn('faculty_feedback insert notice:', dbErr.message);
    }

    // Deliver notification to student
    try {
      await supabaseAdmin.from('notifications').insert([{
        user_id: targetStudentId,
        title: `New Feedback from ${faculty.fullName || 'Faculty'}`,
        message: `Category: ${category || 'Academic Guidance'}\n\n${content.trim()}`,
        type: 'info',
        category: 'academic',
        created_at: new Date().toISOString()
      }]);
    } catch (nErr) {
      console.warn('Notification delivery notice:', nErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback: savedFeedback || { ...feedbackRecord, id: 'fb-' + Date.now() }
    });
  } catch (err) {
    console.error('Error in POST /api/faculty/feedback:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit student feedback.' });
  }
});

// GET /api/faculty/feedback/:studentId
router.get('/feedback/:studentId', authenticateUser, attachCollegeScope, requireFaculty, async (req, res) => {
  try {
    const { studentId } = req.params;
    const faculty = await getFacultyDetailsAndAssignments(req.user.id, req.user.user_metadata, req.userScope);

    const { data: student } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', studentId)
      .maybeSingle();

    if (student) {
      const scopeCheck = verifyFacultyStudentScope(faculty, student);
      if (!scopeCheck.isAuthorized) {
        return res.status(403).json({ success: false, message: `Forbidden. ${scopeCheck.reason}` });
      }
    }

    const { data: feedbackList } = await supabaseAdmin
      .from('faculty_feedback')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    return res.status(200).json({
      success: true,
      feedback: feedbackList || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student feedback.' });
  }
});

export default router;
