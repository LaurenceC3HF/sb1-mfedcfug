export default async function handler(req: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OpenAI API key" }), { status: 401 });
  }

  try {
    const { query, scenario } = await req.json();

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an XAI chatbot analyzing Courses of Action (COAs). The scenario is: ${JSON.stringify(scenario)}. Your task is to respond to the user's query about the COAs and provide explanations structured into the three layers of situational awareness (SA). Format your entire output as a single, valid JSON object. {...}`
        },
        { role: "user", content: query }
      ],
      temperature: 0.7
    };

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await openaiRes.json();

    if (!openaiRes.ok) {
      return new Response(JSON.stringify({ error: result.error?.message || "Unknown error" }), { status: openaiRes.status });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
