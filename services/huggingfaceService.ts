import { Settings } from '../types';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

export async function runHuggingFace(
  prompt: string,
  settings: Settings
): Promise<string> {
  const { 
    apiKey, 
    model = 'microsoft/DialoGPT-medium', 
    baseUrl = 'https://api-inference.huggingface.co' 
  } = settings.huggingface;
  const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};

  if (!apiKey) {
    throw new Error('Hugging Face API key is required');
  }

  const response = await fetchWithTimeout(`${baseUrl}/models/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens || 2000,
        temperature: creativityTemperature,
        top_p: topP,
        do_sample: true,
        return_full_text: false,
      },
    }),
    timeout: 120000, // 120 seconds, doubled from typical 60
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || response.statusText}`);
  }

  const data = await response.json();
  
  // Handle different response formats
  if (Array.isArray(data) && data.length > 0) {
    return data[0].generated_text || data[0].text || '';
  }
  
  return data.generated_text || data.text || '';
}

export async function* runHuggingFaceStream(
  prompt: string,
  settings: Settings
): AsyncGenerator<string, void, unknown> {
  const { 
    apiKey, 
    model = 'microsoft/DialoGPT-medium', 
    baseUrl = 'https://api-inference.huggingface.co' 
  } = settings.huggingface;
  const { creativityTemperature = 0.7, topP = 0.9, maxTokens = null } = settings.advanced || {};

  if (!apiKey) {
    throw new Error('Hugging Face API key is required');
  }

  const response = await fetchWithTimeout(`${baseUrl}/models/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens || 2000,
        temperature: creativityTemperature,
        top_p: topP,
        do_sample: true,
        return_full_text: false,
      },
      stream: true,
    }),
    timeout: 120000, // 120 seconds, doubled from typical 60
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || response.statusText}`);
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
            
            // Handle different streaming response formats
            let content = '';
            if (parsed.token) {
              content = parsed.token.text || parsed.token;
            } else if (parsed.generated_text) {
              content = parsed.generated_text;
            } else if (parsed.text) {
              content = parsed.text;
            }
            
            if (content) {
              yield content;
            }
          } catch (e) {
            console.warn('Failed to parse Hugging Face stream chunk:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}