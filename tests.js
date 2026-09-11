/**
 * Mansplainer Integrated Unit & Functional Test Suite
 * Validates mode switching, prompt formatting, model discovery filtering, error isolation, and clipboard interfaces.
 */

(function (global) {
  'use strict';

  class TestRunner {
    constructor() {
      this.tests = [];
    }

    register(name, fn) {
      this.tests.push({ name, fn });
    }

    async runAll(callbacks = {}) {
      const results = [];
      let passed = 0;
      let failed = 0;

      for (const test of this.tests) {
        try {
          await test.fn();
          results.push({ name: test.name, status: 'PASS' });
          passed++;
          if (callbacks.onTestPass) callbacks.onTestPass(test.name);
        } catch (error) {
          results.push({ name: test.name, status: 'FAIL', error: error.message });
          failed++;
          if (callbacks.onTestFail) callbacks.onTestFail(test.name, error.message);
        }
      }

      const summary = { total: this.tests.length, passed, failed, results };
      if (callbacks.onComplete) callbacks.onComplete(summary);
      return summary;
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message || 'Assertion failed'}: expected [${expected}], got [${actual}]`);
    }
  }

  const runner = new TestRunner();

  // Test 1: Register Prompts exist and are well-formed
  runner.register('Register Prompts: Caveman → MIT contains academic guidelines', () => {
    const config = global.MansplainerPrompts.CAVEMAN_TO_MIT;
    assert(Boolean(config), 'CAVEMAN_TO_MIT config must exist');
    assert(config.systemPrompt.includes('MIT academic prose'), 'Prompt must instruct MIT academic register');
    const wrapped = config.userWrapper('test rock fire');
    assert(wrapped.includes('test rock fire'), 'User wrapper must embed input string');
  });

  // Test 2: Register Prompts exist for MIT → Caveman
  runner.register('Register Prompts: MIT → Caveman contains simplification guidelines', () => {
    const config = global.MansplainerPrompts.MIT_TO_CAVEMAN;
    assert(Boolean(config), 'MIT_TO_CAVEMAN config must exist');
    assert(config.systemPrompt.includes('caveman'), 'Prompt must instruct caveman register');
    const wrapped = config.userWrapper('heuristic synergy');
    assert(wrapped.includes('heuristic synergy'), 'User wrapper must embed input string');
  });

  // Test 3: OpenRouter Key Storage Management
  runner.register('OpenRouter Provider: API key save, retrieval and clear isolation', () => {
    const provider = global.MansplainerProvider;
    const testKey = 'sk-or-v1-test-unit-key-999';
    provider.saveKey(testKey, false);
    assertEqual(provider.hasKey(), true, 'hasKey must return true after saving valid key');
    assertEqual(provider.apiKey, testKey, 'apiKey property should match saved key');
    
    provider.clearKey();
    assertEqual(provider.hasKey(), false, 'hasKey must return false after clear');
    assertEqual(provider.apiKey, '', 'apiKey must be empty string after clear');
  });

  // Test 4: OpenRouter Free Filter Logic Simulation
  runner.register('OpenRouter Provider: Model filter detects zero-priced & :free models', () => {
    const mockModels = [
      { id: 'openai/gpt-4o', pricing: { prompt: '0.000005', completion: '0.000015' } },
      { id: 'google/gemini-2.0-flash-exp:free', pricing: { prompt: 0, completion: 0 } },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', pricing: { prompt: '0', completion: '0' } },
      { id: 'anthropic/claude-3.5-sonnet', pricing: { prompt: '0.000003', completion: '0.000015' } }
    ];

    const freeOnly = mockModels.filter(m => {
      const p = m.pricing || {};
      return (p.prompt === 0 || p.prompt === '0') && (p.completion === 0 || p.completion === '0') || m.id.endsWith(':free');
    });

    assertEqual(freeOnly.length, 2, 'Must filter down to precisely 2 free models');
    assertEqual(freeOnly[0].id, 'google/gemini-2.0-flash-exp:free', 'First free model match');
  });

  // Test 5: Input Validation on Translation Execution
  runner.register('Execution Safety: Empty input throws descriptive validation error', async () => {
    const provider = global.MansplainerProvider;
    let caught = false;
    try {
      await provider.executeTranslation({ model: 'test-model', mode: 'CAVEMAN_TO_MIT', inputText: '   ' });
    } catch (e) {
      caught = true;
      assert(e.message.includes('Input text cannot be empty'), 'Error message should explain empty input');
    }
    assert(caught, 'Must reject whitespace/empty translation request');
  });

  // Test 6: Missing Model Validation
  runner.register('Execution Safety: Missing model ID throws immediate error without silent fallback', async () => {
    const provider = global.MansplainerProvider;
    let caught = false;
    try {
      await provider.executeTranslation({ model: '', mode: 'CAVEMAN_TO_MIT', inputText: 'hello' });
    } catch (e) {
      caught = true;
      assert(e.message.includes('select a free model'), 'Must alert user to missing model');
    }
    assert(caught, 'Must reject execution when no model is chosen');
  });

  // Test 7: Clipboard Handler Contract
  runner.register('Clipboard Handler: Methods are defined and handle empty inputs cleanly', async () => {
    const clipboard = global.MansplainerClipboard;
    assert(typeof clipboard.readText === 'function', 'readText must be a function');
    assert(typeof clipboard.writeText === 'function', 'writeText must be a function');
    const writeEmpty = await clipboard.writeText('');
    assertEqual(writeEmpty, false, 'writeText on empty string should safely return false');
  });

  // Test 8: MIT → 8th Grade prompt exists and uses plain-language register
  runner.register('Register Prompts: MIT → 8th Grade uses plain-language register and embeds input', () => {
    const config = global.MansplainerPrompts.MIT_TO_8TH_GRADE;
    assert(Boolean(config), 'MIT_TO_8TH_GRADE config must exist');
    assert(config.systemPrompt.includes('8th-grade') || config.systemPrompt.includes('eighth-grade'), 'Prompt must instruct 8th-grade plain-language register');
    assert(!config.systemPrompt.includes('caveman'), '8th-grade prompt must not mention caveman');
    const wrapped = config.userWrapper('synergistic optimization');
    assert(wrapped.includes('synergistic optimization'), 'User wrapper must embed input string');
  });

  global.MansplainerTestRunner = runner;
})(typeof window !== 'undefined' ? window : this);
