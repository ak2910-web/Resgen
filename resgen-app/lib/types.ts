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

// ---------------------------------------------------------------------------
// Synthetic user profiles
// ---------------------------------------------------------------------------

export type Gender = "male" | "female" | "non-binary";
export type EducationLevel =
  | "High School"
  | "Undergraduate"
  | "Graduate"
  | "Postgraduate"
  | "Other";

export interface SyntheticProfile {
  id: number;
  name: string;
  age: number;
  email: string;
  gender: Gender;
  occupation: string;
  education: EducationLevel;
  location: string;
}

// ---------------------------------------------------------------------------
// MCQ weighted distribution
// ---------------------------------------------------------------------------

/** Map option → weight (0–100, not required to sum to 100). */
export type OptionWeights = Record<string, number>;

export interface GenerateRequest {
  fields: FormField[];
  mode: ResponseMode;
  count: number;
  csvData?: Record<string, string>[];
  aiPromptContext?: string;
  /** When set, responses are generated using these profiles (cycling through them). */
  profiles?: SyntheticProfile[];
  /** Optional per-field MCQ weights: fieldEntryId → { option → weight } */
  fieldWeights?: Record<string, OptionWeights>;
}

export interface GeneratedResponse {
  entries: Record<string, string | string[]>;
  /** The synthetic profile used to generate this response (if any). */
  profile?: Pick<SyntheticProfile, "id" | "name" | "age" | "occupation">;
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
