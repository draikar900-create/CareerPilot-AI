import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { persistentResourceStore } from '../services/persistentStore.js';

const router = express.Router();

// Helper to determine student rank from database readiness_attempts
async function getStudentRankInfo(userId) {
  try {
    const [{ data: profile }, { data: attempts }] = await Promise.all([
      supabaseAdmin.from('student_profiles').select('college_id, branch, semester').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('readiness_attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    const sem = Number(profile?.semester) || 1;
    const academicYear = sem >= 7 ? '4th Year' : sem >= 5 ? '3rd Year' : sem >= 3 ? '2nd Year' : '1st Year';
    const completed = attempts?.find(a => a.category && a.category.includes('SUBMITTED'));

    if (!completed) {
      return {
        hasTakenAssessment: false,
        rank: null,
        score: 0,
        academicYear,
        collegeId: profile?.college_id || null,
        branch: profile?.branch || null
      };
    }

    const parts = completed.category.split(' | ');
    const rank = parts[1] || (completed.score >= 85 ? 'Platinum' : completed.score >= 70 ? 'Gold' : 'Silver');

    return {
      hasTakenAssessment: true,
      rank,
      score: Number(completed.score) || 0,
      academicYear: parts[0] || academicYear,
      collegeId: profile?.college_id || null,
      branch: profile?.branch || null
    };
  } catch (err) {
    console.error('Error in getStudentRankInfo:', err.message);
    return { hasTakenAssessment: false, rank: null, score: 0, academicYear: '1st Year' };
  }
}

// Access Matrix Evaluator: Checks if student rank satisfies resource access level
function evaluateResourceAccess(studentRank, accessLevel) {
  const level = accessLevel || 'Standard';

  // Standard and Faculty resources are accessible to all authenticated students
  if (level === 'Standard' || level === 'Faculty') {
    return { allowed: true };
  }

  // Unranked students (no assessment taken) cannot unlock Premium or Expert resources
  if (!studentRank) {
    return {
      allowed: false,
      code: 'UNRANKED_ASSESSMENT_REQUIRED',
      message: 'Complete your standardized readiness assessment to unlock rank-based learning access.',
      requiredRank: level === 'Expert' ? 'Platinum' : 'Gold'
    };
  }

  // Premium Content: Allowed for Platinum & Gold, Locked for Silver
  if (level === 'Premium') {
    if (studentRank === 'Platinum' || studentRank === 'Gold') {
      return { allowed: true };
    }
    return {
      allowed: false,
      code: 'CONTENT_LOCKED',
      message: 'This Premium resource requires a Gold or Platinum assessment rank.',
      requiredRank: 'Gold'
    };
  }

  // Expert Content: Allowed ONLY for Platinum, Locked for Gold & Silver
  if (level === 'Expert') {
    if (studentRank === 'Platinum') {
      return { allowed: true };
    }
    return {
      allowed: false,
      code: 'CONTENT_LOCKED',
      message: 'This Expert Masterclass requires a Platinum assessment rank.',
      requiredRank: 'Platinum'
    };
  }

  return { allowed: true };
}

// GET /api/learning/resources
// Returns learning resources with rank-based access control and URL protection
router.get('/resources', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const rankInfo = await getStudentRankInfo(userId);

    // Fetch all resources from DB
    let rawResources = [];
    const { data: dbData, error: dbErr } = await supabaseAdmin
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbData) rawResources = dbData;
    if (dbErr) {
      console.warn('Notice: GET /api/learning/resources DB query:', dbErr.message);
    }

    // Merge with persistent disk store resources
    const persistentList = persistentResourceStore.getAll();
    const existingDbIds = new Set(rawResources.map(r => r.id));
    for (const p of persistentList) {
      if (!existingDbIds.has(p.id)) {
        // Format persistent resource into DB schema representation if needed
        rawResources.push({
          id: p.id,
          title: p.title,
          category: p.category,
          description: typeof p.description === 'string' && p.description.startsWith('{')
            ? p.description
            : JSON.stringify({
                desc: p.description || '',
                type: p.type || 'notes',
                branch: p.branch || 'CSE',
                academic_year: p.academic_year || p.academicYear || '3rd Year',
                subject: p.subject || '',
                topic: p.topic || '',
                author: p.author || 'Faculty'
              }),
          url: p.url,
          is_free: true,
          created_at: p.created_at || p.createdAt || new Date().toISOString()
        });
      }
    }

    // Fetch student's progress
    const { data: progressList } = await supabaseAdmin
      .from('student_resource_progress')
      .select('resource_id, completed')
      .eq('user_id', userId);

    const completedSet = new Set((progressList || []).filter(p => p.completed).map(p => p.resource_id));

    // SECURE MATRIX EVALUATION & URL STRIPPING
    const processedResources = (rawResources || []).map((r) => {
      let parsedMeta = {};
      try {
        if (r.description && r.description.startsWith('{')) {
          parsedMeta = JSON.parse(r.description);
        }
      } catch (e) {}

      const accessLevel = r.access_level || parsedMeta.access_level || 'Standard';
      const isYouTube = Boolean(r.url && (r.url.includes('youtube.com') || r.url.includes('youtu.be')));
      const contentType = r.content_type || parsedMeta.content_type || (isYouTube ? 'Video' : 'Notes');
      const academicYear = r.academic_year || parsedMeta.academic_year || parsedMeta.academicYear || 'All';
      const author = r.author || parsedMeta.author || 'Faculty Member';
      const descriptionText = parsedMeta.desc !== undefined ? parsedMeta.desc : r.description || '';
      const resourceType = isYouTube ? 'youtube' : (parsedMeta.type || 'notes');

      const accessResult = evaluateResourceAccess(rankInfo.rank, accessLevel);

      if (accessResult.allowed) {
        return {
          id: r.id,
          title: r.title,
          category: r.category,
          description: descriptionText,
          url: r.url,
          type: resourceType,
          branch: parsedMeta.branch || 'All',
          subject: parsedMeta.subject || '',
          topic: parsedMeta.topic || '',
          isFree: r.is_free,
          accessLevel,
          contentType,
          academicYear,
          author,
          isLocked: false,
          completed: completedSet.has(r.id),
          createdAt: r.created_at
        };
      } else {
        // STRIP URL AND PROTECTED DATA FOR LOCKED RESOURCES
        return {
          id: r.id,
          title: r.title,
          category: r.category,
          description: descriptionText,
          url: null, // Protected URL stripped
          type: resourceType,
          branch: parsedMeta.branch || 'All',
          subject: parsedMeta.subject || '',
          topic: parsedMeta.topic || '',
          isFree: r.is_free,
          accessLevel,
          contentType,
          academicYear,
          author,
          isLocked: true,
          lockReason: accessResult.message,
          requiredRank: accessResult.requiredRank,
          lockCode: accessResult.code,
          completed: false,
          createdAt: r.created_at
        };
      }
    });

    return res.status(200).json({
      success: true,
      rankInfo,
      resources: processedResources
    });
  } catch (err) {
    console.error('Error in GET /api/learning/resources:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch learning resources.' });
  }
});

function normalizeYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const cleaned = url.trim();
  const watchMatch = cleaned.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (watchMatch && watchMatch[1]) {
    const videoId = watchMatch[1];
    return {
      videoId,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }
  return null;
}

// GET /api/learning/resources/:id/access
// Server-authoritative endpoint to access single resource URL & content
router.get('/resources/:id/access', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Fetch target resource from DB
    let targetRes = null;
    const { data: resource } = await supabaseAdmin
      .from('resources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (resource) {
      targetRes = resource;
    } else {
      // Fallback to persistent disk store
      const p = persistentResourceStore.getAll().find(item => item.id === id);
      if (p) {
        targetRes = {
          id: p.id,
          title: p.title,
          category: p.category,
          description: typeof p.description === 'string' && p.description.startsWith('{')
            ? p.description
            : JSON.stringify({
                desc: p.description || '',
                type: p.type || 'notes',
                branch: p.branch || 'CSE',
                academic_year: p.academic_year || p.academicYear || '3rd Year',
                subject: p.subject || '',
                topic: p.topic || '',
                author: p.author || 'Faculty'
              }),
          url: p.url,
          is_free: true,
          created_at: p.created_at || p.createdAt || new Date().toISOString()
        };
      }
    }

    if (!targetRes) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    // Check student's rank directly from database
    const rankInfo = await getStudentRankInfo(userId);

    let parsedMeta = {};
    try {
      if (targetRes.description && targetRes.description.startsWith('{')) {
        parsedMeta = JSON.parse(targetRes.description);
      }
    } catch (e) {}

    const accessLevel = targetRes.access_level || parsedMeta.access_level || 'Standard';

    // SERVER-SIDE AUTHORIZATION CHECK
    const accessResult = evaluateResourceAccess(rankInfo.rank, accessLevel);

    if (!accessResult.allowed) {
      return res.status(403).json({
        success: false,
        code: accessResult.code,
        message: accessResult.message,
        requiredRank: accessResult.requiredRank,
        currentRank: rankInfo.rank || 'Unranked'
      });
    }

    // Mark access in progress log
    try {
      await supabaseAdmin
        .from('student_resource_progress')
        .upsert({
          user_id: userId,
          resource_id: id,
          last_accessed_at: new Date().toISOString()
        }, { onConflict: 'user_id,resource_id' });
    } catch (e) {
      console.warn('Progress log notice:', e.message);
    }

    const isYouTube = Boolean(targetRes.url && (targetRes.url.includes('youtube.com') || targetRes.url.includes('youtu.be')));
    const ytInfo = normalizeYouTubeUrl(targetRes.url);

    return res.status(200).json({
      success: true,
      resource: {
        id: targetRes.id,
        title: targetRes.title,
        url: ytInfo?.watchUrl || targetRes.url,
        watchUrl: ytInfo?.watchUrl || targetRes.url,
        embedUrl: ytInfo?.embedUrl || targetRes.url,
        videoId: ytInfo?.videoId || null,
        thumbnailUrl: ytInfo?.thumbnailUrl || '',
        accessLevel,
        contentType: isYouTube ? 'Video' : (targetRes.content_type || parsedMeta.content_type || 'Notes'),
        type: isYouTube ? 'youtube' : (parsedMeta.type || 'notes'),
        description: parsedMeta.desc !== undefined ? parsedMeta.desc : targetRes.description
      }
    });
  } catch (err) {
    console.error('Error in GET /api/learning/resources/:id/access:', err);
    return res.status(500).json({ success: false, message: 'Server error authorizing resource access.' });
  }
});

// POST /api/learning/resources/:id/progress
// Toggles completion state for unlocked resource
router.post('/resources/:id/progress', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { completed } = req.body;

    const { data: updated, error } = await supabaseAdmin
      .from('student_resource_progress')
      .upsert({
        user_id: userId,
        resource_id: id,
        completed: Boolean(completed),
        last_accessed_at: new Date().toISOString()
      }, { onConflict: 'user_id,resource_id' })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, progress: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update resource progress.' });
  }
});

export default router;
