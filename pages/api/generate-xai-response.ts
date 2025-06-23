import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 401 });
    }

    const { query, scenario } = await req.json();

    const payload = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
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
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7
    };

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!openaiRes.ok) {
      const errorData = await openaiRes.json().catch(() => ({}));
      const message = errorData.error?.message || openaiRes.statusText;
      return NextResponse.json({ error: `OpenAI error: ${message}` }, { status: openaiRes.status });
    }

    const result = await openaiRes.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No content returned from OpenAI.' }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(content));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Unexpected error occurred.' }, { status: 500 });
  }
}

