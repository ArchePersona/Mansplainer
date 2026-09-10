/**
 * Mansplainer OpenRouter Provider Module
 * Decouples OpenRouter dynamic model discovery, zero-cost filtering, prompt formatting,
 * and chat completion execution from the UI layer.
 */

(function (global) {
  'use strict';

  const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';
  const STORAGE_KEY_API_KEY = 'mansplainer_openrouter_key';

  // System prompt templates tuned specifically for zero hallucination and strict register fidelity
  const REGISTER_PROMPTS = {
    CAVEMAN_TO_MIT: {
      name: 'Caveman → MIT',
      systemPrompt: `You are Mansplainer's Dual-Register Linguistic Engine. 
Your task: Convert crude, blunt, primitive, or informal caveman-style language into rigorous, highly articulate, technically erudite MIT academic prose.

CRITICAL CONSTRAINTS:
1. Preserve the EXACT core intent, causal relationships, and facts without inventing or hallucinating extra claims.
2. Employ precise scientific, mathematical, or academic nomenclature.
3. Maintain professional, objective, academic decorum.
4. Output ONLY the translated text. Do not provide meta-commentary, preambles, or explanations.`,
      userWrapper: (input) => `Translate this primitive input into MIT academic register:
"""
${input}
"""`
    },

    MIT_TO_CAVEMAN: {
      name: 'MIT → Caveman',
      systemPrompt: `You are Mansplainer's Dual-Register Linguistic Engine. 
Your task: Reduce complex corporate jargon, academic prose, high-level theory, and technical fluff into crude, simple, punchy, blunt, primitive caveman statements.

CRITICAL CONSTRAINTS:
1. Strip all jargon and buzzwords. Use short, guttural, direct words (e.g. "me", "make", "fire", "rock", "fast", "no work", "big broken").
2. Never drop the essential truth or consequence of the message.
3. Output ONLY the translated caveman text. Do not provide quotes, introductory conversational filler, or commentary.`,
      userWrapper: (input) => `Translate this academic/corporate text into direct caveman register:
"""
${input}
"""`
    }
  };

  class OpenRouterProvider {
    constructor() {
      this.apiKey = this.loadStoredKey();
      this.cachedFreeModels = [];
    }

    loadStoredKey() {
      try {
        return sessionStorage.getItem(STORAGE_KEY_API_KEY) || localStorage.getItem(STORAGE_KEY_API_KEY) || '';
      } catch (e) {
        return '';
      }
    }

    saveKey(key, persistInLocal = false) {
      this.apiKey = (key || '').trim();
      try {
        if (persistInLocal) {
          localStorage.setItem(STORAGE_KEY_API_KEY, this.apiKey);
        } else {
          sessionStorage.setItem(STORAGE_KEY_API_KEY, this.apiKey);
        }
      } catch (e) {
        console.warn('Storage error saving API key:', e);
      }
      return this.apiKey;
    }

    clearKey() {
      this.apiKey = '';
      try {
        sessionStorage.removeItem(STORAGE_KEY_API_KEY);
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      } catch (e) {
        console.warn('Storage error clearing API key:', e);
      }
    }

    hasKey() {
      return Boolean(this.apiKey && this.apiKey.length > 5);
    }

    /**
     * Fetches models from OpenRouter and filters strictly for free (0 prompt and 0 completion price).
     * @returns {Promise<Array<{id: string, name: string, context_length: number}>>}
     */
    async fetchFreeModels() {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${OPENROUTER_API_BASE}/models`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to discover models from OpenRouter (HTTP ${response.status}: ${response.statusText})`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.data)) {
        throw new Error('Malformed model payload returned from OpenRouter API.');
      }

      // Filter for zero-cost free models
      const freeModels = data.data.filter((model) => {
        const pricing = model.pricing || {};
        const isPromptZero = pricing.prompt === 0 || pricing.prompt === '0' || pricing.prompt === '0.0';
        const isCompletionZero = pricing.completion === 0 || pricing.completion === '0' || pricing.completion === '0.0';
        const hasFreeSuffix = typeof model.id === 'string' && model.id.toLowerCase().endsWith(':free');
        
        return (isPromptZero && isCompletionZero) || hasFreeSuffix;
      });

      // Sort cleanly, putting well-known free flagship models at top
      freeModels.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
      this.cachedFreeModels = freeModels;
      return freeModels;
    }

    /**
     * Executes translation chat completion with selected free model and register mode.
     * @param {Object} options
     * @param {string} options.model - Model ID (e.g., 'google/gemini-2.0-flash-exp:free')
     * @param {string} options.mode - 'CAVEMAN_TO_MIT' or 'MIT_TO_CAVEMAN'
     * @param {string} options.inputText - Text to transform
     * @returns {Promise<{text: string, model: string, durationMs: number}>}
     */
    async executeTranslation({ model, mode, inputText }) {
      if (!inputText || !inputText.trim()) {
        throw new Error('Input text cannot be empty.');
      }
      if (!model) {
        throw new Error('Please select a free model before executing translation.');
      }

      const modeConfig = REGISTER_PROMPTS[mode];
      if (!modeConfig) {
        throw new Error(`Unsupported linguistic mode: "${mode}".`);
      }

      const headers = {
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin || 'https://mansplainer.app',
        'X-Title': 'Mansplainer Register Translator'
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const payload = {
        model: model,
        messages: [
          { role: 'system', content: modeConfig.systemPrompt },
          { role: 'user', content: modeConfig.userWrapper(inputText.trim()) }
        ],
        temperature: 0.35,
        max_tokens: 1024
      };

      const startTime = performance.now();
      const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const durationMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) {
            errorDetail = typeof errJson.error === 'string' ? errJson.error : (errJson.error.message || JSON.stringify(errJson.error));
          }
        } catch (parseErr) {
          errorDetail = response.statusText || errorDetail;
        }
        throw new Error(`OpenRouter Execution Failure [${model}]: ${errorDetail}`);
      }

      const resultData = await response.json();
      const choice = resultData.choices && resultData.choices[0];
      if (!choice || !choice.message || typeof choice.message.content !== 'string') {
        throw new Error('OpenRouter returned an unexpected or empty completion payload.');
      }

      return {
        text: choice.message.content.trim(),
        model: resultData.model || model,
        durationMs
      };
    }
  }

  // Export singleton and configuration
  global.MansplainerProvider = new OpenRouterProvider();
  global.MansplainerPrompts = REGISTER_PROMPTS;
})(typeof window !== 'undefined' ? window : this);
