// src/services/ai/claude.js
// Kept as claude.js to avoid changing all imports
// Now uses Groq API with llama-3.3-70b-versatile model

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = 'llama-3.3-70b-versatile';

// Base text call — returns plain string response
const callClaude = async (systemPrompt, userMessage, maxTokens = 1024) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
    temperature: 0.3,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Groq returned empty response');
  return text;
};

// JSON call — strips markdown code fences and parses JSON
export const callClaudeJSON = async (systemPrompt, userMessage, maxTokens = 1024) => {
  const enhancedSystem = `${systemPrompt}

IMPORTANT: Your response must be valid JSON only. Do not include any explanation, markdown formatting, or code blocks. Do not wrap in \`\`\`json or \`\`\`. Output raw JSON only.`;

  const raw = await callClaude(enhancedSystem, userMessage, maxTokens);

  const cleaned = raw
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/\s*```$/im, '')
    .trim();

  const jsonStart = cleaned.search(/[[{]/);
  if (jsonStart === -1) {
    throw new Error(`Groq did not return JSON. Got: ${cleaned.slice(0, 200)}`);
  }
  const jsonStr = cleaned.slice(jsonStart);

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse Groq JSON response: ${jsonStr.slice(0, 300)}`);
  }
};

export default callClaude;
