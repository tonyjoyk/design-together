import 'dotenv/config';

const MODEL = 'claude-sonnet-4-6';
const RATE_LIMIT_RETRY_MS = 15000;

export function parseJsonResponse(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

function isRateLimitError(msg) {
  return /rate limit/i.test(msg);
}

async function anthropicRequest(body, retried = false) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to your .env file.');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data.error?.message || `Anthropic API error (${res.status})`;
    if (isRateLimitError(msg) && !retried) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_RETRY_MS));
      return anthropicRequest(body, true);
    }
    throw new Error(msg);
  }

  const text = data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('') || '';
  if (!text) {
    throw new Error('Empty response from Anthropic API');
  }

  return text;
}

export async function callClaude({ system, messages, max_tokens = 4096 }) {
  return anthropicRequest({
    model: MODEL,
    max_tokens,
    system,
    messages,
  });
}

export async function callClaudeJson(opts) {
  const text = await callClaude(opts);
  return parseJsonResponse(text);
}

export async function callClaudeStructured({ system, messages, max_tokens = 4096, schema }) {
  const text = await anthropicRequest({
    model: MODEL,
    max_tokens,
    system,
    messages,
    output_config: {
      format: {
        type: 'json_schema',
        schema,
      },
    },
  });
  return JSON.parse(text);
}
