import { Settings } from '../types';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export async function runOpenAI(
  prompt: string,
  settings: Settings
): Promise<string> {
  const { apiKey, model = 'gpt-3.5-turbo', baseUrl = 'https://api.openai.com/v1' } = settings.openai;
  const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: creativityTemperature,
      top_p: topP,
      max_tokens: maxTokens || undefined,
    }),
    timeout: 120000, // 120 seconds, doubled from typical 60
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function* runOpenAIStream(
  prompt: string,
  settings: Settings
): AsyncGenerator<string, void, unknown> {
  const { apiKey, model = 'gpt-3.5-turbo', baseUrl = 'https://api.openai.com/v1' } = settings.openai;
  const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const response = await fetchWithTimeout(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: creativityTemperature,
      top_p: topP,
      max_tokens: maxTokens || undefined,
      stream: true,
    }),
    timeout: 120000, // 120 seconds, doubled from typical 60
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === '' || trimmed === 'data: [DONE]') continue;
        
        if (trimmed.startsWith('data: ')) {
          try {
            const jsonStr = trimmed.slice(6);
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            console.warn('Failed to parse OpenAI stream chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}