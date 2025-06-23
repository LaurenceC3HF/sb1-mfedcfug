import { XAIExplanation } from '../types';

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

export const generateXAIResponse = async (
  query: string,
  scenario: any
): Promise<XAIExplanation> => {
  try {
    const response = await fetch('/api/generate-xai-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, scenario })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      throw new APIError(`Backend API request failed: ${errorMessage}`, response.status);
    }

    const result = await response.json();
    return result as XAIExplanation;

  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    console.error('Client API Error:', error);
    throw new APIError("Failed to communicate with backend API");
  }
};

