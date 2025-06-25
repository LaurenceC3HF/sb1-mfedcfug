import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const { query, scenario } = req.body;

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

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      return res.status(response.status).json({ error: errorMessage });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No response content received from OpenAI' });
    }

    const parsed = JSON.parse(content);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to generate AI response' });
  }
}
