import type {
  ScamAnalysisResult,
  DocumentItem,
  DocumentSummary,
  FormGuide,
  FormFieldExplanation,
  UserPreferences,
} from '../types';

const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('digital_saathi_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('digital_saathi_token', token);
  } else {
    localStorage.removeItem('digital_saathi_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData.detail) {
        errorMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(formData: { email?: string; password?: string }) {
    return request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },

  async register(data: { email: string; password: string; full_name: string; preferred_language: string }) {
    return request<{ id: number; email: string; full_name: string; preferred_language: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCurrentUser() {
    return request<{ id: number; email: string; full_name: string; preferred_language: string }>('/auth/me');
  },

  // Assistant / Chat
  async chatAssistant(message: string, language: string = 'hi', conversationId?: string) {
    return request<{
      reply: string;
      language: string;
      conversation_id: string;
      suggested_actions: string[];
      source_grounding?: string;
    }>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, conversation_id: conversationId }),
    });
  },

  // Scam Detector
  async analyzeScam(content: string, type: string = 'sms_text', language: string = 'hi') {
    return request<ScamAnalysisResult>('/scams/analyze', {
      method: 'POST',
      body: JSON.stringify({ content, type, language }),
    });
  },

  // Document Saathi
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async listDocuments() {
    return request<DocumentItem[]>('/documents');
  },

  async summarizeDocument(docId: number) {
    return request<DocumentSummary>(`/documents/${docId}/summarize`, {
      method: 'POST',
    });
  },

  async askDocument(docId: number, question: string, language: string = 'hi') {
    return request<{ answer: string; language: string; page_references: number[] }>(`/documents/${docId}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question, language }),
    });
  },

  async deleteDocument(docId: number) {
    return request<{ message: string }>(`/documents/${docId}`, {
      method: 'DELETE',
    });
  },

  // Forms Saathi
  async listForms() {
    return request<FormGuide[]>('/forms');
  },

  async getFormDetails(formId: string) {
    return request<FormGuide>(`/forms/${formId}`);
  },

  async explainFormField(formId: string, fieldName: string, language: string = 'hi') {
    return request<FormFieldExplanation>(`/forms/${formId}/explain-field`, {
      method: 'POST',
      body: JSON.stringify({ field_name: fieldName, language }),
    });
  },

  // Preferences
  async getPreferences() {
    return request<UserPreferences>('/preferences');
  },

  async updatePreferences(prefs: Partial<UserPreferences>) {
    return request<UserPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  },
};
