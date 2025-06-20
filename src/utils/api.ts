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
    const systemPrompt = `You are an XAI chatbot analyzing Courses of Action (COAs). The scenario is: ${JSON.stringify(scenario)}. Your task is to respond to the user's query about the COAs and provide explanations structured into the three layers of situational awareness (SA). Format your entire output as a single, valid JSON object.
    {
      "defaultTab": "[Choose one: insight, reasoning, or projection]",
      "response": "[Your concise response to the query.]",
      "insight": { "text": "[SA Level 1: Perception. 'What are the key facts?'. Be factual about the COAs.]", "lime": ["key_factor_1", "key_factor_2"] },
      "reasoning": { "text": "[SA Level 2: Comprehension. 'Why is one COA better?'. Explain cause-effect and trade-offs.]", "dag": { "nodes": [], "edges": [] }, "shap": {} },
      "projection": { "text": "[SA Level 3: Projection. 'What might happen?'. Predict outcomes for a chosen COA.]", "alternatives": [{"title": "What if for COA X...", "details": "Outcome..."}] },
      "confidence": "[An integer percentage.]",
      "suggestedPrompts": ["Prompt 1", "Prompt 2", "Prompt 3"]
    }`;

    const conversation = [{
      role: "user",
      parts: [{ text: `${systemPrompt}\n\nUser Query: ${query}` }]
    }];

    // Note: In production, the API key should be stored securely
    const apiKey = typeof window !== 'undefined' && (window as any).__api_key 
      ? (window as any).__api_key 
      : "";
      
    if (!apiKey) {
      throw new APIError("API key not configured", 401);
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: conversation,
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new APIError(`API request failed: ${response.statusText}`, response.status);
    }

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonText) {
      throw new APIError("No response content received from API");
    }

    return JSON.parse(jsonText);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof SyntaxError) {
      throw new APIError("Invalid response format from AI service");
    }
    
    throw new APIError("Failed to generate AI response");
  }
};