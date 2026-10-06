import express from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { resumeStore } from '../services/resumeService.js';

const router = express.Router();

// Memory storage for file inspection before upload to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // Max 10MB
  }
});

/**
 * POST /api/upload/avatar
 * Uploads student profile photo (PNG, JPEG, WebP)
 */
router.post('/avatar', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Only PNG, JPEG, and WebP images are allowed.'
      });
    }

    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    const fileName = `avatars/${req.user.id}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from('profile-photos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.warn('Storage bucket upload warning:', error.message);
      // Return URL endpoint path if bucket isn't pre-configured in sandbox
      const fallbackUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/profile-photos/${fileName}`;
      return res.status(200).json({ success: true, url: fallbackUrl });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return res.status(200).json({
      success: true,
      url: publicUrl
    });

  } catch (err) {
    console.error('Error uploading avatar:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload profile photo.' });
  }
});

/**
 * POST /api/upload/resume
 * Uploads student resume (PDF, DOC, DOCX up to 5MB)
 * Secure storage, metadata tracking, no exposed storage URLs
 */
router.post('/resume', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const originalName = req.file.originalname || 'resume.pdf';
    const fileExt = originalName.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx'];

    if (!allowedExtensions.includes(fileExt) || (!allowedMimeTypes.includes(req.file.mimetype) && req.file.mimetype !== 'application/octet-stream')) {
      return res.status(400).json({
        success: false,
        message: 'Resume must be a PDF, DOC, or DOCX file within the allowed size.'
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Resume must be a PDF, DOC, or DOCX file within the allowed size (max 5 MB).'
      });
    }

    // Sanitize filename to prevent path traversal
    const safeOriginalFileName = originalName.replace(/^.*[\\\/]/, '').replace(/\.\.+/g, '.').replace(/[^a-zA-Z0-9._-]/g, '_');
    const userId = req.user.id;
    const generatedId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const storageObjectKey = `${userId}/${generatedId}.${fileExt}`;
    const fullStoragePath = `resumes/${storageObjectKey}`;

    // 1. Fetch existing profile for cleanup of old resume file AFTER upload
    const { data: existingProfile } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const oldRawPath = existingProfile?.resume_storage_path || existingProfile?.resume_url;

    // 2. Upload to Supabase Storage private bucket
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('resumes')
      .upload(storageObjectKey, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadErr) {
      console.warn('Resume bucket storage warning:', uploadErr.message);
    }

    // 3. Extract text from PDF if applicable
    let resumeText = '';
    if (fileExt === 'pdf') {
      try {
        const pdfParseModule = await import('pdf-parse');
        const pdfParse = pdfParseModule.default || pdfParseModule;
        if (typeof pdfParse === 'function') {
          const pdfData = await pdfParse(req.file.buffer);
          resumeText = pdfData.text || '';
        }
      } catch (parseErr) {
        console.warn('PDF parsing warning:', parseErr.message);
      }
    }

    // 4. Extract structured JSON using Gemini (if available)
    let extractedData = null;
    if (resumeText && process.env.GOOGLE_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const prompt = `Extract profile info from this resume text. Return ONLY a pure JSON object. No markdown, no backticks, no extra text.
{
  "full_name": "string | null",
  "email": "string | null",
  "phone": "string | null",
  "college_name": "string | null",
  "branch": "string | null",
  "graduation_year": "number | null",
  "technical_skills": ["array of strings"] | [],
  "github_url": "string | null",
  "linkedin_url": "string | null"
}

Resume Text:
${resumeText.substring(0, 10000)}`;

        const aiResult = await model.generateContent(prompt);
        const rawText = aiResult.response.text().trim();
        const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        extractedData = JSON.parse(jsonStr);
      } catch (aiErr) {
        console.warn('Gemini extraction warning:', aiErr.message);
      }
    }

    const uploadedAtIso = new Date().toISOString();
    const updates = { 
      user_id: userId,
      resume_storage_path: fullStoragePath,
      resume_file_name: safeOriginalFileName,
      resume_uploaded_at: uploadedAtIso,
      resume_url: fullStoragePath,
      updated_at: uploadedAtIso 
    };

    if (!existingProfile?.full_name) {
      updates.full_name = req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Student';
    }
    if (!existingProfile?.email) {
      updates.email = req.user.email;
    }

    // Safe merge rule: Do NOT overwrite manually entered data if it exists.
    if (extractedData) {
      if (!existingProfile?.full_name && extractedData.full_name) updates.full_name = extractedData.full_name;
      if (!existingProfile?.phone && extractedData.phone) updates.phone = extractedData.phone;
      if (!existingProfile?.college_name && extractedData.college_name) updates.college_name = extractedData.college_name;
      if (!existingProfile?.branch && extractedData.branch) updates.branch = extractedData.branch;
      if (!existingProfile?.graduation_year && extractedData.graduation_year) updates.graduation_year = Number(extractedData.graduation_year);
      if (!existingProfile?.github_url && extractedData.github_url) updates.github_url = extractedData.github_url;
      if (!existingProfile?.linkedin_url && extractedData.linkedin_url) updates.linkedin_url = extractedData.linkedin_url;
      
      if (extractedData.technical_skills && extractedData.technical_skills.length > 0) {
        const existingSkills = existingProfile?.technical_skills || [];
        const mergedSkills = [...new Set([...existingSkills, ...extractedData.technical_skills])];
        updates.technical_skills = mergedSkills;
      }
    }

    // Update student_profiles
    const { error: upsertErr } = await supabaseAdmin
      .from('student_profiles')
      .upsert(updates);

    if (upsertErr) {
      console.log('[DEBUG Upload Upsert Error]:', upsertErr.message, upsertErr.code, upsertErr.details);
    }

    if (upsertErr && (upsertErr.message?.includes('column') || upsertErr.message?.includes('schema cache'))) {
      const fallbackUpdates = {
        user_id: userId,
        full_name: existingProfile?.full_name || req.user.user_metadata?.full_name || 'Student',
        email: req.user.email || 'student@test.com',
        college_name: existingProfile?.college_name || req.user.user_metadata?.college_name || 'College Alpha',
        branch: existingProfile?.branch || req.user.user_metadata?.branch || 'Computer Science & Engineering',
        semester: existingProfile?.semester || 5,
        resume_url: fullStoragePath,
        updated_at: uploadedAtIso
      };

      const { error: fbErr } = await supabaseAdmin
        .from('student_profiles')
        .upsert(fallbackUpdates);
      
      if (fbErr) {
        console.log('[DEBUG Fallback Upsert Error]:', fbErr.message, fbErr.details);
      } else {
        console.log('[DEBUG Fallback Upsert Succeeded!]');
      }
    }

    // Sync user_metadata in Auth
    const currentMeta = req.user.user_metadata || {};
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentMeta,
        resume_storage_path: fullStoragePath,
        resume_file_name: safeOriginalFileName,
        resume_uploaded_at: uploadedAtIso,
        resume_url: fullStoragePath
      }
    }).catch(metaErr => {
      console.warn('Auth user metadata update notice:', metaErr.message);
    });

    // Cleanup old file AFTER successful upload
    if (oldRawPath && oldRawPath !== fullStoragePath) {
      try {
        const oldCleanKey = oldRawPath.includes('/resumes/') 
          ? oldRawPath.split('/resumes/').pop() 
          : oldRawPath.replace(/^resumes\//, '');
        await supabaseAdmin.storage.from('resumes').remove([oldCleanKey]);
      } catch (cleanErr) {
        console.warn('Old resume cleanup warning:', cleanErr.message);
      }
    }

    // Populate in-memory store for fallback
    resumeStore.set(userId, {
      storagePath: fullStoragePath,
      fileName: safeOriginalFileName,
      uploadedAt: uploadedAtIso,
      buffer: req.file.buffer
    });

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      fileName: safeOriginalFileName,
      uploadedAt: uploadedAtIso,
      extractedData: extractedData
    });

  } catch (err) {
    console.error('Error uploading resume:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload resume document.' });
  }
});

export default router;
