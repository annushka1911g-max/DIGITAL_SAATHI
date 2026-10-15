export type Language = 'hi' | 'en';

export interface UserPreferences {
  language: Language;
  font_size: 'normal' | 'large' | 'xlarge';
  high_contrast: boolean;
  dark_mode: boolean;
  reduced_motion: boolean;
  screen_reader_optimized: boolean;
  speech_rate: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  preferred_language: Language;
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioUrl?: string;
}

export interface ScamAnalysisResult {
  risk_level: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK';
  risk_score: number;
  verdict_summary: string;
  reasons: string[];
  safety_advice: string[];
  helpline_info?: string;
}

export interface DocumentItem {
  id: number;
  original_filename: string;
  file_type: string;
  file_size: number;
  page_count: number;
  summary?: string;
  created_at: string;
}

export interface DocumentSummary {
  document_id: number;
  filename: string;
  page_count: number;
  summary: string;
  key_points: string[];
  important_dates: string[];
  amounts_mentioned: string[];
  actions_required: string[];
}

export interface FormFieldExplanation {
  field_name: string;
  display_label: string;
  simple_explanation: string;
  common_mistake: string;
  example_input: string;
  is_mandatory: boolean;
}

export interface FormGuide {
  form_id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  total_steps: number;
  simple_explanation: string;
  required_documents_hint: string[];
  fields: FormFieldExplanation[];
}
