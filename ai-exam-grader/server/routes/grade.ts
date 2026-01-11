import { Router, type Request, type Response } from 'express';
import type { GradingRequest } from '../../src/types/grading';
import { GradingService } from '../services/GradingService';

const router = Router();

router.post('/grade', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      success: false, 
      error: { code: 'CONFIG_ERROR', message: 'OPENAI_API_KEY not configured in .env' } 
    });
  }

  try {
    const request = req.body as GradingRequest;

    if (!request.rubric || !request.rubric.criteria || request.rubric.criteria.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Rubric with at least one criterion is required' }
      });
    }

    if (!request.examImages || request.examImages.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'At least one exam image is required' }
      });
    }

    const gradingService = new GradingService(apiKey);
    const result = await gradingService.grade(request);

    return res.json({ success: true, data: result });

  } catch (e: any) {
    console.error('[GradeAPI] Error:', e);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'PROCESSING_ERROR',
        message: e?.message || 'An error occurred during grading'
      }
    });
  }
});

export default router;
