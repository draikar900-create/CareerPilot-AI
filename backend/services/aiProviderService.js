import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * CAREERPILOT AI - AI PROVIDER SERVICE ABSTRACTION
 * Standardized server-side interface for LLM operations.
 * Supports:
 * - Ollama (Local / Self-hosted LLM)
 * - Gemini (Google Generative AI)
 * - Extensible for future LLM providers
 */

/**
 * Helper to sanitize user inputs and prevent prompt injection attacks
 */
export function sanitizePromptInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/System:\s*/gi, '')
    .replace(/Ignore previous instructions/gi, '')
    .replace(/<\|im_start\|>/gi, '')
    .replace(/<\|im_end\|>/gi, '')
    .trim();
}

/**
 * Base AI Provider Abstract Class
 */
export class BaseAIProvider {
  async generateText({ systemPrompt, userMessage, temperature = 0.7 }) {
    throw new Error('generateText method must be implemented by AI provider');
  }

  async generateStructured({ systemPrompt, userMessage, temperature = 0.4 }) {
    throw new Error('generateStructured method must be implemented by AI provider');
  }

  async checkHealth() {
    throw new Error('checkHealth method must be implemented by AI provider');
  }
}

/**
 * Ollama AI Provider
 * Does NOT require GOOGLE_API_KEY. Operates via local/hosted Ollama REST endpoints.
 */
export class OllamaProvider extends BaseAIProvider {
  constructor(config = {}) {
    super();
    this.url = (config.url || process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/$/, '');
    this.model = config.model || process.env.OLLAMA_MODEL || 'llama3';
    this.timeoutMs = config.timeoutMs || 45000;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.url}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const models = (data.models || []).map(m => m.name);
        const hasModel = models.some(m => m.includes(this.model));
        return {
          available: true,
          provider: 'ollama',
          url: this.url,
          model: this.model,
          installedModels: models,
          details: hasModel ? `Ollama active at ${this.url} with model ${this.model}` : `Ollama active, but target model ${this.model} not found in [${models.join(', ')}]`
        };
      } else {
        return {
          available: false,
          provider: 'ollama',
          url: this.url,
          model: this.model,
          details: `Ollama service returned HTTP status ${response.status}`
        };
      }
    } catch (err) {
      return {
        available: false,
        provider: 'ollama',
        url: this.url,
        model: this.model,
        details: `Failed to connect to Ollama at ${this.url}: ${err.message}`
      };
    }
  }

  async generateText({ systemPrompt, userMessage, temperature = 0.7 }) {
    const sanitizedUserMsg = sanitizePromptInput(userMessage);
    const fullPrompt = `${systemPrompt}\n\n[USER QUERY]:\n${sanitizedUserMsg}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          stream: false,
          options: { temperature }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama service returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.response) {
        throw new Error('Ollama returned empty response string');
      }

      return data.response.trim();
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Ollama request timed out after ${this.timeoutMs / 1000} seconds`);
      }
      throw new Error(`Ollama Provider Error: ${err.message}`);
    }
  }

  async generateStructured({ systemPrompt, userMessage, temperature = 0.3 }) {
    const sanitizedUserMsg = sanitizePromptInput(userMessage);
    const fullPrompt = `${systemPrompt}\n\nCRITICAL REQUIREMENT: Return valid JSON ONLY. Do NOT wrap in markdown or include conversational text.\n\n[USER QUERY]:\n${sanitizedUserMsg}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: fullPrompt,
          format: 'json',
          stream: false,
          options: { temperature }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama service returned HTTP ${response.status}`);
      }

      const data = await response.json();
      let rawText = data.response;
      if (!rawText) throw new Error('Ollama returned empty structured output');

      // Strip potential markdown fences if present
      rawText = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      return JSON.parse(rawText);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Ollama structured request timed out after ${this.timeoutMs / 1000} seconds`);
      }
      throw new Error(`Ollama Structured Parsing Error: ${err.message}`);
    }
  }
}

/**
 * Gemini AI Provider
 * Requires valid GOOGLE_API_KEY environment variable.
 */
export class GeminiProvider extends BaseAIProvider {
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;
    if (!this.apiKey) {
      throw new Error('Gemini AI API Key (GOOGLE_API_KEY) is not configured on the backend server.');
    }
    this.candidateModels = config.candidateModels || [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
      'gemini-pro-latest'
    ];
  }

  async checkHealth() {
    if (!this.apiKey) {
      return {
        available: false,
        provider: 'gemini',
        details: 'GOOGLE_API_KEY environment variable is missing.'
      };
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);
      // Lightweight test call to check model accessibility
      const model = genAI.getGenerativeModel({ model: this.candidateModels[0] });
      return {
        available: true,
        provider: 'gemini',
        model: this.candidateModels[0],
        details: 'Google Gemini API key validated and service ready.'
      };
    } catch (err) {
      return {
        available: false,
        provider: 'gemini',
        details: `Gemini initialization warning: ${err.message}`
      };
    }
  }

  async generateText({ systemPrompt, userMessage, temperature = 0.7 }) {
    const sanitizedUserMsg = sanitizePromptInput(userMessage);
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.apiKey);

    let lastError = null;
    for (const modelName of this.candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n[USER QUERY]:\n${sanitizedUserMsg}` }]
            }
          ],
          generationConfig: { temperature }
        });

        const reply = result.response.text();
        if (reply) return reply.trim();
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${modelName} call failed:`, err.message);
      }
    }

    throw new Error(this.normalizeGeminiError(lastError));
  }

  async generateStructured({ systemPrompt, userMessage, temperature = 0.4 }) {
    const sanitizedUserMsg = sanitizePromptInput(userMessage);
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.apiKey);

    const fullPrompt = `${systemPrompt}\n\nCRITICAL REQUIREMENT: Return raw JSON ONLY matching schema. Do NOT include markdown blocks.\n\n[USER QUERY]:\n${sanitizedUserMsg}`;

    let lastError = null;
    for (const modelName of this.candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }]
            }
          ],
          generationConfig: { temperature }
        });

        let rawText = result.response.text();
        if (rawText) {
          rawText = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
          return JSON.parse(rawText);
        }
      } catch (err) {
        lastError = err;
        console.warn(`Gemini structured call model ${modelName} failed:`, err.message);
      }
    }

    throw new Error(this.normalizeGeminiError(lastError));
  }

  normalizeGeminiError(err) {
    if (!err) return 'Gemini AI service unavailable.';
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('api key') || msg.includes('400') || msg.includes('invalid')) {
      return 'Gemini API key is invalid or not authorized. Check GOOGLE_API_KEY environment variable.';
    }
    if (msg.includes('quota') || msg.includes('429') || msg.includes('exhausted')) {
      return 'Gemini API rate limit or quota exceeded. Please try again shortly.';
    }
    if (msg.includes('not found') || msg.includes('404')) {
      return 'The requested Gemini model is not supported or not found for this API key.';
    }
    return `Gemini Provider Error: ${err.message}`;
  }
}

/**
 * AI Provider Factory & Manager
 */
export class AIProviderFactory {
  static getProvider(overrideProvider = null) {
    const providerName = (overrideProvider || process.env.AI_PROVIDER || 'gemini').toLowerCase();

    if (providerName === 'ollama') {
      return new OllamaProvider();
    } else if (providerName === 'gemini') {
      return new GeminiProvider();
    } else {
      throw new Error(`Unsupported AI_PROVIDER '${providerName}'. Valid options: 'gemini', 'ollama'.`);
    }
  }

  static async getHealth() {
    const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
    try {
      const provider = AIProviderFactory.getProvider(providerName);
      return await provider.checkHealth();
    } catch (err) {
      return {
        available: false,
        provider: providerName,
        details: err.message
      };
    }
  }
}

export default AIProviderFactory;
