import fs from 'fs';
import path from 'path';
import type { GradingRequest, GradingResult } from '../../src/types/grading';
import { SYSTEM_PROMPT, buildUserPrompt } from '../../lib/prompts';
import { parseJSONResponse, prepareImagesForAPI } from '../../lib/api-helpers';

export class GradingService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async grade(request: GradingRequest): Promise<GradingResult> {
    const { referenceImages, rubric, examImages } = request;
    const gradingId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`[${gradingId}] Starting grading...`);

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

    const openAIRequestBody = {
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ],
      max_tokens: 4096,
      temperature: 0.1,
    };

    this.logRequest(gradingId, openAIRequestBody);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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

    const parsed = parseJSONResponse<any>(content);
    const processingTime = Date.now() - startTime;

    return {
      gradingId: gradingId,
      timestamp: new Date().toISOString(),
      modelUsed: this.model,
      processingTimeMs: processingTime,
      extraction: parsed.extraction,
      taskGrades: parsed.taskGrades,
      totalPoints: parsed.totalPoints,
      maxTotalPoints: parsed.maxTotalPoints,
      overallPercentage: parsed.overallPercentage,
      overallFeedback: parsed.overallFeedback,
      status: 'success'
    };
  }

  private logRequest(gradingId: string, body: any) {
    try {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logFilePath = path.join(logDir, `openai-request-${gradingId}.json`);
        const logData = {
          ...body,
          messages: body.messages.map((msg: any) => ({
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
    } catch (e) {
        console.error('Failed to log request:', e);
    }
  }
}
