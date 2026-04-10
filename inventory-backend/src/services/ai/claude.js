const callClaude = async (systemPrompt, userMessage, maxTokens = 1024) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

// Helper: parse JSON from Claude response safely
// Claude sometimes wraps JSON in markdown code blocks — strip them
export const callClaudeJSON = async (systemPrompt, userMessage, maxTokens = 1024) => {
  const raw = await callClaude(systemPrompt, userMessage, maxTokens);
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Claude returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
};

export default callClaude;
