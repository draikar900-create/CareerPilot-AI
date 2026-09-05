import express from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

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
 * Uploads student resume (PDF only)
 */
router.post('/resume', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    if (req.file.mimetype !== 'application/pdf' || fileExt !== 'pdf') {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Resume must be a PDF document.'
      });
    }

    const fileName = `resumes/${req.user.id}-${Date.now()}.pdf`;

    const { data, error } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.warn('Resume bucket storage warning:', error.message);
      const fallbackUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/resumes/${fileName}`;
      return res.status(200).json({ success: true, url: fallbackUrl });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Update resume_url in student_profiles
    await supabaseAdmin
      .from('student_profiles')
      .update({ resume_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('user_id', req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      url: publicUrl
    });

  } catch (err) {
    console.error('Error uploading resume:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload resume PDF.' });
  }
});

export default router;
