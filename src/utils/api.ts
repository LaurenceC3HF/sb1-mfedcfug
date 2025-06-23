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
    // Get API key from environment variables with fallback
    let apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    // Fallback to check if it's available in window object (for deployed apps)
    if (!apiKey && typeof window !== 'undefined') {
      apiKey = (window as any).__openai_api_key;
    }
    
    // Debug logging (remove in production)
    console.log('API Key available:', !!apiKey);
    console.log('Environment variables:', import.meta.env);
      
    if (!apiKey) {
      throw new APIError("OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable or configure it in the deployment settings.", 401);
    }

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are an XAI chatbot analyzing Courses of Action (COAs). The scenario is: ${JSON.stringify(scenario)}. Your task is to respond to the user's query about the COAs and provide explanations structured into the three layers of situational awareness (SA). Format your entire output as a single, valid JSON object.
          {
            "defaultTab": "[Choose one: insight, reasoning, or projection]",
            "response": "[Your concise response to the query.]",
            "insight": { "text": "[SA Level 1: Perception. 'What are the key facts?'. Be factual about the COAs.]", "lime": ["key_factor_1", "key_factor_2"] },
            "reasoning": { "text": "[SA Level 2: Comprehension. 'Why is one COA better?'. Explain cause-effect and trade-offs.]", "dag": { "nodes": [], "edges": [] }, "shap": {} },
            "projection": { "text": "[SA Level 3: Projection. 'What might happen?'. Predict outcomes for a chosen COA.]", "alternatives": [{"title": "What if for COA X...", "details": "Outcome..."}] },
            "confidence": "[An integer percentage.]",
            "suggestedPrompts": ["Prompt 1", "Prompt 2", "Prompt 3"]
          }` 
        },
        { role: "user", content: query }
      ],
      temperature: 0.7
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      throw new APIError(`OpenAI API request failed: ${errorMessage}`, response.status);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new APIError("No response content received from OpenAI API");
    }

    // Parse the JSON response from OpenAI
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof SyntaxError) {
      throw new APIError("Invalid response format from AI service");
    }
    
    console.error('API Error:', error);
    throw new APIError("Failed to generate AI response");
  }
};
