import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import type { GradingRequest } from '../../src/types/grading';
import { SYSTEM_PROMPT, buildUserPrompt } from '../../lib/prompts';
import { parseJSONResponse, prepareImagesForAPI } from '../../lib/api-helpers';

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
    const { referenceImages, rubric, examImages } = req.body as GradingRequest;

    if (!rubric || !rubric.criteria || rubric.criteria.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Rubric with at least one criterion is required' }
      });
    }

    if (!examImages || examImages.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'At least one exam image is required' }
      });
    }

    const model = 'gpt-4o';
    const gradingId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[${gradingId}] Starting grading...`);
    console.log(`[${gradingId}] Exam images: ${examImages.length}`);
    console.log(`[${gradingId}] Reference images: ${referenceImages?.length || 0}`);

    const rubricJson = JSON.stringify(rubric, null, 2);
    const hasReferenceImages = (referenceImages?.length || 0) > 0;
    const userPromptText = buildUserPrompt(rubricJson, hasReferenceImages);

    const examImageContents = prepareImagesForAPI(examImages);
    
    const userContent: Array<any> = [
      { type: 'text', text: userPromptText },
      ...examImageContents
    ];

    if (referenceImages && referenceImages.length > 0) {
      const referenceImageContents = prepareImagesForAPI(referenceImages);
      userContent.push(
        { type: 'text', text: '\n\n--- REFERENTNI MATERIJALI ---\n' },
        ...referenceImageContents
      );
    }

    console.log(`[${gradingId}] Calling OpenAI API...`);
    
    const openAIRequestBody = {
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ],
      max_tokens: 4096,
      temperature: 0.1,
    };

    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFilePath = path.join(logDir, `openai-request-${gradingId}.json`);
    const logData = {
      ...openAIRequestBody,
      messages: openAIRequestBody.messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' 
          ? msg.content 
          : msg.content.map((c: any) => 
              c.type === 'image_url' 
                ? { type: 'image_url', image_url: { url: '[BASE64_IMAGE_TRUNCATED]', detail: c.image_url.detail } }
                : c
            )
      }))
    };
    fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
    console.log(`[${gradingId}] Request logged to: ${logFilePath}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openAIRequestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    console.log(`[${gradingId}] Parsing response...`);
    const parsed = parseJSONResponse<any>(content);

    const processingTime = Date.now() - startTime;
    console.log(`[${gradingId}] Done in ${processingTime}ms`);

    const result = {
      grading_id: gradingId,
      timestamp: new Date().toISOString(),
      model_used: model,
      processing_time_ms: processingTime,
      extraction: parsed.extraction,
      task_grades: parsed.task_grades,
      total_points: parsed.total_points,
      max_total_points: parsed.max_total_points,
      overall_percentage: parsed.overall_percentage,
      overall_feedback: parsed.overall_feedback,
      status: 'success'
    };

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
