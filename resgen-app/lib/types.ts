export type FieldType =
  | "short_answer"
  | "paragraph"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "linear_scale"
  | "date"
  | "time";

export interface FormField {
  entryId: string;
  question: string;
  type: FieldType;
  options?: string[];
  required: boolean;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
}

export interface AnalyzeResponse {
  formTitle: string;
  formDescription?: string;
  fields: FormField[];
  submitUrl: string;
}

export type ResponseMode = "random" | "ai" | "csv";

export interface GenerateRequest {
  fields: FormField[];
  mode: ResponseMode;
  count: number;
  csvData?: Record<string, string>[];
  aiPromptContext?: string;
}

export interface GeneratedResponse {
  entries: Record<string, string | string[]>;
}

export interface GenerateResponse {
  responses: GeneratedResponse[];
}

export interface SubmitRequest {
  submitUrl: string;
  responses: GeneratedResponse[];
  delayMs?: number;
}

export interface SubmitResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}
