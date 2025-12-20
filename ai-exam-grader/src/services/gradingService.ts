import type { 
  GradingResult, 
  GradingRequest, 
  GradingRubric, 
  EncodedImage 
} from '../types/grading';
import { SYSTEM_PROMPT, buildUserPrompt } from '../../lib/prompts';
import { parseJSONResponse, prepareImagesForAPI } from '../../lib/api-helpers';

export type { EncodedImage, GradingRubric, GradingRequest };

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export class GradingService {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(
    apiKey: string, 
    model: string = 'gpt-4o', 
    baseUrl: string = 'https://api.openai.com/v1'
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async gradeExam(request: GradingRequest): Promise<GradingResult> {
    const startTime = Date.now();
    const gradingId = crypto.randomUUID();

    try {
      console.log(`[GradingService:${gradingId}] Započinjem ocjenjivanje...`);

      const rubricJson = JSON.stringify(request.rubric, null, 2);
      const hasReferenceImages = (request.referenceImages?.length || 0) > 0;
      const userPromptText = buildUserPrompt(rubricJson, hasReferenceImages);

      const examImageContents = prepareImagesForAPI(request.examImages);
      
      const userContent: Array<any> = [
        { type: 'text', text: userPromptText },
        ...examImageContents
      ];

      if (request.referenceImages && request.referenceImages.length > 0) {
        const referenceImageContents = prepareImagesForAPI(request.referenceImages);
        userContent.push(
          { type: 'text', text: '\n\n--- REFERENTNI MATERIJALI ---\n' },
          ...referenceImageContents
        );
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userContent }
          ],
          max_tokens: 4096,
          temperature: 0.1,
        }),
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
      
      console.log(`[GradingService:${gradingId}] Završeno za ${processingTime}ms`);

      return {
        grading_id: gradingId,
        timestamp: new Date().toISOString(),
        model_used: this.model,
        extraction: parsed.extraction,
        task_grades: parsed.task_grades,
        total_points: parsed.total_points,
        max_total_points: parsed.max_total_points,
        overall_percentage: parsed.overall_percentage,
        overall_feedback: parsed.overall_feedback,
        status: 'success'
      };

    } catch (error) {
      console.error(`[GradingService:${gradingId}] Greška:`, error);
      
      return {
        grading_id: gradingId,
        timestamp: new Date().toISOString(),
        model_used: this.model,
        extraction: {
          tasks: [],
          total_tasks_detected: 0,
          unreadable_sections: [],
          extraction_confidence: 'low'
        },
        task_grades: [],
        total_points: 0,
        max_total_points: request.rubric.globalMaxPoints,
        overall_percentage: 0,
        overall_feedback: '',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

let gradingServiceInstance: GradingService | null = null;

export function getGradingService(apiKey: string, model?: string): GradingService {
  if (!gradingServiceInstance) {
    gradingServiceInstance = new GradingService(apiKey, model);
  }
  return gradingServiceInstance;
}

export interface FormData {
  referenceImages: Array<{ id: string; file: File; preview: string }>;
  criteria: Array<{ id: string; criterion: string; maxPoints: number; guidance: string }>;
  globalMaxPoints: number;
  examImages: Array<{ id: string; file: File; preview: string }>;
}

export async function prepareGradingRequest(formData: FormData): Promise<GradingRequest> {
  const referenceImages: EncodedImage[] = await Promise.all(
    formData.referenceImages.map(async (img) => ({
      id: img.id,
      filename: img.file.name,
      base64: await fileToBase64(img.file),
      mimeType: img.file.type
    }))
  );

  const examImages: EncodedImage[] = await Promise.all(
    formData.examImages.map(async (img) => ({
      id: img.id,
      filename: img.file.name,
      base64: await fileToBase64(img.file),
      mimeType: img.file.type
    }))
  );

  const rubric: GradingRubric = {
    name: 'Kriteriji ocjenjivanja',
    globalMaxPoints: formData.globalMaxPoints,
    criteria: formData.criteria.map(c => ({
      id: c.id,
      criterion: c.criterion,
      maxPoints: c.maxPoints,
      guidance: c.guidance
    }))
  };

  return {
    referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
    rubric,
    examImages
  };
}
