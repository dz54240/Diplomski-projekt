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
  task_number: number;
  task_text: string;
  student_answer: string;
}

export interface ExtractionResult {
  tasks: ExtractedTask[];
  total_tasks_detected: number;
  unreadable_sections: string[];
  extraction_confidence: "high" | "medium" | "low";
}

export interface CriterionGrade {
  criterion_id: string;
  criterion_name: string;
  awarded_points: number;
  max_points: number;
  justification: string;
  strengths: string[];
  improvements: string[];
}

export interface TaskGrade {
  task_number: number;
  task_text: string;
  student_answer: string;
  analysis: string;
  criterion_grades: CriterionGrade[];
  total_points: number;
  max_points: number;
  percentage: number;
  feedback_summary: string;
}

export interface GradingResult {
  grading_id: string;
  timestamp: string;
  model_used: string;
  extraction: ExtractionResult;
  task_grades: TaskGrade[];
  total_points: number;
  max_total_points: number;
  overall_percentage: number;
  overall_feedback: string;
  status: "success" | "partial" | "error";
  error_message?: string;
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
