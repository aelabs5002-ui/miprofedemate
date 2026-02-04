/**
 * Utilidad para llamar al backend del Tutor IA
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { LibraryContext } from '../tipos/bibliotecaTutor';

export interface TutorRequest {
  userId: string;
  sessionId: string;
  exerciseId: string;
  grade: string;
  topic: string;
  studentAnswer: string;
  attemptNumber: number;
  mode: 'text' | 'voice';
  exercisePrompt: string;
  hintAllowed: boolean;
  systemPrompt?: string;
  libraryContext?: LibraryContext;
}

export interface TutorResponse {
  assistantText: string;
  nextAction: 'retry' | 'hint' | 'next';
  meta: {
    tokensIn: number;
    tokensOut: number;
    responseTime?: number;
    model?: string;
  };
}

export interface TutorError {
  error: string;
  message?: string;
}

/**
 * Llama al endpoint del tutor IA para obtener feedback
 */
export async function getTutorFeedback(request: TutorRequest): Promise<TutorResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tutor/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData: TutorError = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: TutorResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling tutor API:', error);
    throw error;
  }
}

/**
 * Verifica si el backend está disponible
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}