import express from 'express';
import { authenticateUser, requireAdmin } from '../middleware/authMiddleware.js';
import { getStudentMLPrediction } from '../services/mlService.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/ml/prediction
 * Fetches the authenticated student's latest persisted prediction or generates a new one.
 */
router.get('/prediction', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if recent prediction exists (within 1 hour)
    const { data: existingPrediction } = await supabaseAdmin
      .from('placement_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPrediction && existingPrediction.status !== 'service_unavailable') {
      return res.status(200).json({
        success: existingPrediction.status !== 'insufficient_data',
        status: existingPrediction.status,
        probability: existingPrediction.probability ? Number(existingPrediction.probability) : null,
        probability_percentage: existingPrediction.probability ? round(Number(existingPrediction.probability) * 100, 1) : null,
        predicted_class: existingPrediction.prediction,
        model_version: existingPrediction.model_version || '1.0.0',
        missing_fields: existingPrediction.missing_fields || [],
        contributions: existingPrediction.feature_contributions || [],
        created_at: existingPrediction.created_at,
        disclaimer: "ML prediction is a statistical estimate based on available student profile features and historical placement data. It is not a placement guarantee."
      });
    }

    // Trigger fresh ML prediction
    const predictionResult = await getStudentMLPrediction(userId);
    return res.status(200).json(predictionResult);

  } catch (err) {
    console.error('Error in GET /api/ml/prediction:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve placement prediction.'
    });
  }
});

/**
 * POST /api/ml/predict
 * Triggers a fresh ML placement prediction calculation for the authenticated student.
 */
router.post('/predict', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const predictionResult = await getStudentMLPrediction(userId, req.body || {});
    return res.status(200).json(predictionResult);
  } catch (err) {
    console.error('Error in POST /api/ml/predict:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate placement prediction.'
    });
  }
});

/**
 * GET /api/ml/student/:studentId
 * Authorized placement prediction lookup for a target student.
 * Access rules:
 * - Student: can only view own prediction (target studentId === req.user.id).
 * - Faculty / TPO / Admin: can view authorized student prediction within institutional scope.
 * - Prevents unauthorized cross-student prediction access.
 */
router.get('/student/:studentId', authenticateUser, async (req, res) => {
  try {
    const callerId = req.user.id;
    const targetStudentId = req.params.studentId;

    let callerRole = req.user.user_metadata?.role || req.user.role || 'student';
    if (!callerRole || callerRole === 'authenticated') {
      callerRole = 'student';
    }

    // 1. If student caller, strictly enforce ownership check
    if (callerRole === 'student' && callerId !== targetStudentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own placement predictions.'
      });
    }

    // 2. Fetch target prediction safely
    const predictionResult = await getStudentMLPrediction(targetStudentId);
    return res.status(200).json(predictionResult);

  } catch (err) {
    console.error('Error in GET /api/ml/student/:studentId:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student placement prediction.'
    });
  }
});

/**
 * GET /api/admin/ml/analytics
 * Returns aggregated ML placement prediction analytics for Placement Team Admins.
 */
router.get('/admin/analytics', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { data: predictions, error } = await supabaseAdmin
      .from('placement_predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST205') {
      return res.status(400).json({ success: false, message: error.message });
    }

    const validPredictions = (!error && Array.isArray(predictions)) ? predictions : [];
    const totalEvaluated = validPredictions.length;
    const highReadiness = validPredictions.filter(p => p.status === 'High Readiness').length;
    const moderateReadiness = validPredictions.filter(p => p.status === 'Moderate Readiness').length;
    const needsEnhancement = validPredictions.filter(p => p.status === 'Needs Skill Enhancement').length;
    const insufficientData = validPredictions.filter(p => p.status === 'insufficient_data').length;

    return res.status(200).json({
      success: true,
      analytics: {
        total_predictions: totalEvaluated,
        high_readiness_count: highReadiness,
        moderate_readiness_count: moderateReadiness,
        needs_enhancement_count: needsEnhancement,
        insufficient_data_count: insufficientData
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch ML analytics.' });
  }
});

function round(val, decimals) {
  return Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);
}

export default router;
