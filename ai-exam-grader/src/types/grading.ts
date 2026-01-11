export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

export interface GradingCriterion {
  id: string;
  criterion: string;
  maxPoints: number;
  guidance: string;
}

export interface GradingRubric {
  name: string;
  globalMaxPoints: number;
  criteria: GradingCriterion[];
}

export interface EncodedImage {
  id: string;
  filename: string;
  base64: string;
  mimeType: string;
}

export interface GradingRequest {
  referenceImages?: EncodedImage[];
  rubric: GradingRubric;
  examImages: EncodedImage[];
}

export interface ExtractedTask {
  taskNumber: number;
  taskText: string;
  studentAnswer: string;
}

export interface ExtractionResult {
  tasks: ExtractedTask[];
  totalTasksDetected: number;
  unreadableSections: string[];
  extractionConfidence: "high" | "medium" | "low";
}

export interface CriterionGrade {
  criterionId: string;
  criterionName: string;
  awardedPoints: number;
  maxPoints: number;
  justification: string;
  strengths: string[];
  improvements: string[];
}

export interface TaskGrade {
  taskNumber: number;
  taskText: string;
  studentAnswer: string;
  analysis: string;
  criterionGrades: CriterionGrade[];
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  feedbackSummary: string;
}

export interface GradingResult {
  gradingId: string;
  timestamp: string;
  modelUsed: string;
  processingTimeMs?: number;
  extraction: ExtractionResult;
  taskGrades: TaskGrade[];
  totalPoints: number;
  maxTotalPoints: number;
  overallPercentage: number;
  overallFeedback: string;
  status: "success" | "partial" | "error";
  errorMessage?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}
