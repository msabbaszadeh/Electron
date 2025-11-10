import { Settings } from '../types';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export async function runAlibaba(
  prompt: string,
  settings: Settings
): Promise<string> {
  const { 
    apiKey, 
    model = 'qwen-turbo', 
    baseUrl = 'https://dashscope.aliyuncs.com/api/v1' 
  } = settings.alibaba;
  const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};

  if (!apiKey) {
    throw new Error('Alibaba Cloud API key is required');
  }

  const response = await fetchWithTimeout(`${baseUrl}/services/aigc/text-generation/generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: {
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      parameters: {
        temperature: creativityTemperature,
        max_tokens: maxTokens || undefined,
        top_p: topP,
      },
    }),
    timeout: 120000, // 120 seconds, doubled from typical 60
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Alibaba API error: ${response.status} - ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  return data.output?.text || '';
}

export async function* runAlibabaStream(
  prompt: string,
  settings: Settings
): AsyncGenerator<string, void, unknown> {
  const { 
    apiKey, 
    model = 'qwen-turbo', 
    baseUrl = 'https://dashscope.aliyuncs.com/api/v1' 
  } = settings.alibaba;
  const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};

  if (!apiKey) {
    throw new Error('Alibaba Cloud API key is required');
  }

  const response = await fetchWithTimeout(`${baseUrl}/services/aigc/text-generation/generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-SSE': 'enable',
    },
    body: JSON.stringify({
      model,
      input: {
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      parameters: {
        temperature: creativityTemperature,
        max_tokens: maxTokens || undefined,
        top_p: topP,
        incremental_output: true,
      },
    }),
    timeout: 120000, // 120 seconds, doubled from typical 60
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Alibaba API error: ${response.status} - ${errorData.message || response.statusText}`);
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
        
        if (trimmed.startsWith('data:')) {
          try {
            const jsonStr = trimmed.slice(5).trim();
            const parsed = JSON.parse(jsonStr);
            const content = parsed.output?.text;
            if (content) {
              yield content;
            }
          } catch (e) {
            console.warn('Failed to parse Alibaba stream chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}