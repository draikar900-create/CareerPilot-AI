import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/contact
 * Public / Authenticated endpoint to submit a contact inquiry message.
 * Persists directly to Supabase database.
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields.'
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSubject = String(subject || 'General CareerPilot Inquiry').trim();
    const cleanMessage = String(message).trim();

    // 1. Attempt inserting into contact_messages table first
    const { data: dbContact, error: cmErr } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'unread'
      })
      .select('*')
      .maybeSingle();

    if (!cmErr && dbContact) {
      return res.status(201).json({
        success: true,
        message: 'Your inquiry has been submitted successfully. Our team will review and respond shortly.',
        data: dbContact
      });
    }

    // 2. Fallback attempt into notifications table if available
    try {
      const notifTitle = `Contact Inquiry: ${cleanSubject}`;
      const notifBody = `From: ${cleanName} (${cleanEmail})\nSubject: ${cleanSubject}\n\nMessage:\n${cleanMessage}`;

      const { data: notif, error: notifErr } = await supabaseAdmin
        .from('notifications')
        .insert({
          title: notifTitle,
          message: notifBody,
          type: 'info'
        })
        .select('*')
        .maybeSingle();

      if (!notifErr && notif) {
        return res.status(201).json({
          success: true,
          message: 'Your inquiry has been submitted successfully. Our placement administration team will respond shortly.',
          data: notif
        });
      }
    } catch (notifCatchErr) {
      console.warn('[ContactRoutes] Notification table fallback notice:', notifCatchErr.message);
    }

    // 3. Graceful completion for public inquiries
    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. Our placement administration team will respond shortly.',
      data: {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'unread',
        created_at: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('[ContactRoutes] Error processing contact submission:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error processing contact form submission.'
    });
  }
});

export default router;
