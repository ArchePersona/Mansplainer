/**
 * Mansplainer Application Controller
 * Coordinates UI interactions, state transitions, dynamic model discovery, clipboard operations,
 * and test executions.
 */

(function (global) {
  'use strict';

  // Preset Samples for Fast Demonstration
  const PRESETS = [
    {
      mode: 'CAVEMAN_TO_MIT',
      label: '🦴 Make computer go fast',
      text: 'Me want computer go fast. Computer freeze when me open big file. Fix now with more brain stick.'
    },
    {
      mode: 'CAVEMAN_TO_MIT',
      label: '🦴 Fire bad on server',
      text: 'Server make hot smoke. Website go dead. Users yell at me. Me pour cold water on metal box.'
    },
    {
      mode: 'MIT_TO_CAVEMAN',
      label: '🏛️ Synergistic Paradigm',
      text: 'We must leverage cross-functional heuristic paradigms to optimize latency throughput and reduce distributed state bifurcations across microservice architectures.'
    },
    {
      mode: 'MIT_TO_CAVEMAN',
      label: '🏛️ Quantum Entanglement',
      text: 'Non-local quantum correlations demonstrate instantaneous state collapsing across spatially separated entangled photon pairs without violating relativistic causality bounds.'
    }
  ];

  // Fallback default free models if network call to discovery encounters strict CORS before API key
  const FALLBACK_FREE_MODELS = [
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Google: Gemini 2.0 Flash (Free)' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Meta: Llama 3.3 70B Instruct (Free)' },
    { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek: DeepSeek R1 (Free)' },
    { id: 'qwen/qwen-2.5-coder-32b-instruct:free', name: 'Qwen: Qwen 2.5 Coder 32B (Free)' },
    { id: 'mistralai/mistral-small-24b-instruct-2501:free', name: 'Mistral: Mistral Small 24B (Free)' },
    { id: 'google/gemini-2.0-pro-exp-02-05:free', name: 'Google: Gemini 2.0 Pro Exp (Free)' }
  ];

  class MansplainerApp {
    constructor() {
      this.state = {
        mode: 'CAVEMAN_TO_MIT', // 'CAVEMAN_TO_MIT' | 'MIT_TO_CAVEMAN'
        selectedModel: '',
        freeModels: [],
        isTranslating: false,
        copyTimeoutId: null
      };

      this.dom = {};
      this.init();
    }

    init() {
      this.cacheDom();
      this.bindEvents();
      this.renderPresets();
      this.updateKeyStatusUI();
      this.discoverModels();
      this.updateModeUI();
    }

    cacheDom() {
      this.dom = {
        brandEmoji: document.getElementById('brandEmoji'),
        modeCavemanToMit: document.getElementById('modeCavemanToMit'),
        modeMitToCaveman: document.getElementById('modeMitToCaveman'),
        modelSelect: document.getElementById('modelSelect'),
        modelCountBadge: document.getElementById('modelCountBadge'),
        refreshModelsBtn: document.getElementById('refreshModelsBtn'),
        presetChips: document.getElementById('presetChips'),
        inputRegisterTag: document.getElementById('inputRegisterTag'),
        outputRegisterTag: document.getElementById('outputRegisterTag'),
        sourceInput: document.getElementById('sourceInput'),
        inputCharCount: document.getElementById('inputCharCount'),
        clearInputBtn: document.getElementById('clearInputBtn'),
        translateBtn: document.getElementById('translateBtn'),
        outputDisplay: document.getElementById('outputDisplay'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingStatusText: document.getElementById('loadingStatusText'),
        copyBadge: document.getElementById('copyBadge'),
        manualCopyBtn: document.getElementById('manualCopyBtn'),
        clearOutputBtn: document.getElementById('clearOutputBtn'),
        swapDirectionBtn: document.getElementById('swapDirectionBtn'),
        telemetryModel: document.getElementById('telemetryModel'),
        telemetryLatency: document.getElementById('telemetryLatency'),
        pasteNotification: document.getElementById('pasteNotification'),
        errorAlert: document.getElementById('errorAlert'),
        errorTitle: document.getElementById('errorTitle'),
        errorMessage: document.getElementById('errorMessage'),
        dismissErrorBtn: document.getElementById('dismissErrorBtn'),
        apiKeyBtn: document.getElementById('apiKeyBtn'),
        keyStatusDot: document.getElementById('keyStatusDot'),
        keyStatusText: document.getElementById('keyStatusText'),
        apiKeyModal: document.getElementById('apiKeyModal'),
        apiKeyInput: document.getElementById('apiKeyInput'),
        toggleKeyVisibilityBtn: document.getElementById('toggleKeyVisibilityBtn'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        clearKeyBtn: document.getElementById('clearKeyBtn'),
        saveKeyBtn: document.getElementById('saveKeyBtn'),
        runTestsBtn: document.getElementById('runTestsBtn'),
        testResultsContainer: document.getElementById('testResultsContainer'),
        testSummaryBar: document.getElementById('testSummaryBar'),
        testList: document.getElementById('testList')
      };
    }

    bindEvents() {
      // Mode switching
      this.dom.modeCavemanToMit.addEventListener('click', () => this.setMode('CAVEMAN_TO_MIT'));
      this.dom.modeMitToCaveman.addEventListener('click', () => this.setMode('MIT_TO_CAVEMAN'));

      // Input character counter
      this.dom.sourceInput.addEventListener('input', () => this.handleInputChange());

      // Double-click paste workflow
      this.dom.sourceInput.addEventListener('dblclick', (e) => this.handleDoubleClickPaste(e));

      // Keyboard shortcut: Ctrl/Cmd + Enter to trigger translation
      this.dom.sourceInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.executeTranslation();
        }
      });

      // Actions
      this.dom.translateBtn.addEventListener('click', () => this.executeTranslation());
      this.dom.clearInputBtn.addEventListener('click', () => this.clearInput());
      this.dom.clearOutputBtn.addEventListener('click', () => this.clearOutput());
      this.dom.manualCopyBtn.addEventListener('click', () => this.copyOutputToClipboard(true));
      this.dom.swapDirectionBtn.addEventListener('click', () => this.swapAndInvert());
      this.dom.refreshModelsBtn.addEventListener('click', () => this.discoverModels(true));
      this.dom.dismissErrorBtn.addEventListener('click', () => this.hideError());

      // Model selection change
      this.dom.modelSelect.addEventListener('change', (e) => {
        this.state.selectedModel = e.target.value;
      });

      // API Key Modal Controls
      this.dom.apiKeyBtn.addEventListener('click', () => this.openKeyModal());
      this.dom.closeModalBtn.addEventListener('click', () => this.closeKeyModal());
      this.dom.saveKeyBtn.addEventListener('click', () => this.saveKey());
      this.dom.clearKeyBtn.addEventListener('click', () => this.clearKey());
      this.dom.toggleKeyVisibilityBtn.addEventListener('click', () => this.toggleKeyVisibility());

      this.dom.apiKeyModal.addEventListener('click', (e) => {
        if (e.target === this.dom.apiKeyModal) this.closeKeyModal();
      });

      // Self-Tests
      this.dom.runTestsBtn.addEventListener('click', () => this.runTestSuite());
    }

    renderPresets() {
      this.dom.presetChips.innerHTML = '';
      PRESETS.forEach((preset) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.textContent = preset.label;
        chip.addEventListener('click', () => {
          this.setMode(preset.mode);
          this.dom.sourceInput.value = preset.text;
          this.handleInputChange();
          this.dom.sourceInput.focus();
        });
        this.dom.presetChips.appendChild(chip);
      });
    }

    setMode(newMode) {
      if (this.state.mode === newMode) return;
      this.state.mode = newMode;
      this.updateModeUI();
    }

    updateModeUI() {
      const isCavemanToMit = this.state.mode === 'CAVEMAN_TO_MIT';
      
      this.dom.modeCavemanToMit.classList.toggle('active', isCavemanToMit);
      this.dom.modeMitToCaveman.classList.toggle('active', !isCavemanToMit);

      if (isCavemanToMit) {
        this.dom.brandEmoji.textContent = '🪨⚡🏛️';
        this.dom.inputRegisterTag.textContent = 'CAVEMAN REGISTER';
        this.dom.inputRegisterTag.className = 'pane-tag';
        this.dom.outputRegisterTag.textContent = 'MIT REGISTER';
        this.dom.outputRegisterTag.className = 'pane-tag mit-tag';
        this.dom.sourceInput.placeholder = 'Enter crude, blunt caveman thought or double-click to paste... e.g., "Make code fast so computer no freeze"';
      } else {
        this.dom.brandEmoji.textContent = '🏛️⚡🪨';
        this.dom.inputRegisterTag.textContent = 'MIT REGISTER';
        this.dom.inputRegisterTag.className = 'pane-tag mit-tag';
        this.dom.outputRegisterTag.textContent = 'CAVEMAN REGISTER';
        this.dom.outputRegisterTag.className = 'pane-tag';
        this.dom.sourceInput.placeholder = 'Enter articulate corporate/academic prose or double-click to paste... e.g., "We must optimize microservice throughput"';
      }
    }

    handleInputChange() {
      const count = this.dom.sourceInput.value.length;
      this.dom.inputCharCount.textContent = `${count} chars`;
      this.hideError();
    }

    async handleDoubleClickPaste(e) {
      // Read from clipboard
      const result = await global.MansplainerClipboard.readText();
      if (result.success && result.text) {
        this.dom.sourceInput.value = result.text;
        this.handleInputChange();
        this.showPasteFeedback();
      } else if (!result.success) {
        // If browser blocked clipboard read without user permission modal
        this.showError('Clipboard Paste Notice', result.error || 'Could not access clipboard automatically. Please press Ctrl+V / Cmd+V.');
      }
    }

    showPasteFeedback() {
      this.dom.pasteNotification.classList.remove('hidden');
      setTimeout(() => {
        this.dom.pasteNotification.classList.add('hidden');
      }, 1600);
    }

    clearInput() {
      this.dom.sourceInput.value = '';
      this.handleInputChange();
      this.dom.sourceInput.focus();
    }

    clearOutput() {
      this.dom.outputDisplay.innerHTML = '<span class="placeholder-text">Translated linguistic transformation will materialize here...</span>';
      this.dom.telemetryModel.textContent = 'Model: -';
      this.dom.telemetryLatency.textContent = 'Latency: -';
      this.dom.copyBadge.classList.add('hidden');
    }

    swapAndInvert() {
      const currentOutput = this.dom.outputDisplay.innerText.trim();
      if (!currentOutput || currentOutput.startsWith('Translated linguistic')) return;

      // Invert mode
      const newMode = this.state.mode === 'CAVEMAN_TO_MIT' ? 'MIT_TO_CAVEMAN' : 'CAVEMAN_TO_MIT';
      this.setMode(newMode);
      
      // Move output into input
      this.dom.sourceInput.value = currentOutput;
      this.handleInputChange();
      this.clearOutput();
      this.dom.sourceInput.focus();
    }

    async discoverModels(isManualRefresh = false) {
      this.dom.modelSelect.disabled = true;
      this.dom.modelCountBadge.textContent = 'Discovering models...';
      if (isManualRefresh) {
        this.dom.refreshModelsBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => this.dom.refreshModelsBtn.style.transform = 'none', 400);
      }

      try {
        let models = await global.MansplainerProvider.fetchFreeModels();
        
        if (!models || models.length === 0) {
          console.warn('No free models matched filter criteria; falling back to curated free flagship list.');
          models = FALLBACK_FREE_MODELS;
        }

        this.state.freeModels = models;
        this.populateModelSelect(models);
        this.dom.modelCountBadge.textContent = `${models.length} FREE MODELS`;
      } catch (err) {
        console.warn('OpenRouter dynamic model discovery failed, loading resilient free tier list:', err);
        this.state.freeModels = FALLBACK_FREE_MODELS;
        this.populateModelSelect(FALLBACK_FREE_MODELS);
        this.dom.modelCountBadge.textContent = `${FALLBACK_FREE_MODELS.length} FREE (CURATED)`;
      } finally {
        this.dom.modelSelect.disabled = false;
      }
    }

    populateModelSelect(models) {
      this.dom.modelSelect.innerHTML = '';
      models.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name || m.id;
        this.dom.modelSelect.appendChild(opt);
      });

      if (models.length > 0) {
        // Default to Google gemini-2.0-flash-exp:free or first
        const preferred = models.find(m => m.id.includes('gemini-2.0-flash') || m.id.includes('llama-3.3-70b'));
        const defaultId = preferred ? preferred.id : models[0].id;
        this.dom.modelSelect.value = defaultId;
        this.state.selectedModel = defaultId;
      }
    }

    async executeTranslation() {
      const input = this.dom.sourceInput.value.trim();
      if (!input) {
        this.showError('Input Missing', 'Please enter some text in the source pane before translating.');
        this.dom.sourceInput.focus();
        return;
      }

      const model = this.dom.modelSelect.value || this.state.selectedModel;
      if (!model) {
        this.showError('Model Required', 'Please select an OpenRouter free model from the dropdown.');
        return;
      }

      this.hideError();
      this.setLoading(true, `Querying ${model.split('/')[1] || model}...`);

      try {
        const result = await global.MansplainerProvider.executeTranslation({
          model,
          mode: this.state.mode,
          inputText: input
        });

        // Render output text
        this.dom.outputDisplay.textContent = result.text;
        this.dom.telemetryModel.textContent = `Model: ${result.model}`;
        this.dom.telemetryLatency.textContent = `Latency: ${result.durationMs}ms`;

        // Automatic clipboard copy workflow as specified
        await this.copyOutputToClipboard(false);
      } catch (err) {
        console.error('Translation error:', err);
        this.showError('Translation Failed', err.message || 'An error occurred during OpenRouter completion dispatch.');
      } finally {
        this.setLoading(false);
      }
    }

    async copyOutputToClipboard(isManual = false) {
      const text = this.dom.outputDisplay.innerText.trim();
      if (!text || text.startsWith('Translated linguistic')) return;

      const copied = await global.MansplainerClipboard.writeText(text);
      if (copied) {
        this.showCopiedBadge();
      } else if (isManual) {
        this.showError('Clipboard Copy', 'Unable to write to clipboard automatically.');
      }
    }

    showCopiedBadge() {
      this.dom.copyBadge.classList.remove('hidden');
      if (this.state.copyTimeoutId) clearTimeout(this.state.copyTimeoutId);
      this.state.copyTimeoutId = setTimeout(() => {
        this.dom.copyBadge.classList.add('hidden');
      }, 2500);
    }

    setLoading(isLoading, statusText = 'Processing register transformation...') {
      this.state.isTranslating = isLoading;
      this.dom.translateBtn.disabled = isLoading;
      this.dom.loadingStatusText.textContent = statusText;
      if (isLoading) {
        this.dom.loadingOverlay.classList.remove('hidden');
      } else {
        this.dom.loadingOverlay.classList.add('hidden');
      }
    }

    showError(title, message) {
      this.dom.errorTitle.textContent = title;
      this.dom.errorMessage.textContent = message;
      this.dom.errorAlert.classList.remove('hidden');
    }

    hideError() {
      this.dom.errorAlert.classList.add('hidden');
    }

    // API Key Management
    openKeyModal() {
      this.dom.apiKeyInput.value = global.MansplainerProvider.apiKey || '';
      this.dom.apiKeyModal.classList.remove('hidden');
      this.dom.apiKeyInput.focus();
    }

    closeKeyModal() {
      this.dom.apiKeyModal.classList.add('hidden');
    }

    saveKey() {
      const key = this.dom.apiKeyInput.value.trim();
      global.MansplainerProvider.saveKey(key, true);
      this.updateKeyStatusUI();
      this.closeKeyModal();
      this.discoverModels(true);
    }

    clearKey() {
      global.MansplainerProvider.clearKey();
      this.dom.apiKeyInput.value = '';
      this.updateKeyStatusUI();
      this.closeKeyModal();
      this.discoverModels(true);
    }

    toggleKeyVisibility() {
      const isPassword = this.dom.apiKeyInput.type === 'password';
      this.dom.apiKeyInput.type = isPassword ? 'text' : 'password';
      this.dom.toggleKeyVisibilityBtn.textContent = isPassword ? '🙈' : '👁️';
    }

    updateKeyStatusUI() {
      const hasKey = global.MansplainerProvider.hasKey();
      if (hasKey) {
        this.dom.keyStatusDot.className = 'key-indicator dot-connected';
        this.dom.keyStatusText.textContent = 'OpenRouter Connected';
      } else {
        this.dom.keyStatusDot.className = 'key-indicator dot-pending';
        this.dom.keyStatusText.textContent = 'OpenRouter Key (Optional)';
      }
    }

    // Built-in verification runner
    async runTestSuite() {
      this.dom.testResultsContainer.classList.remove('hidden');
      this.dom.testList.innerHTML = '';
      this.dom.testSummaryBar.textContent = 'Running architecture & register test suite...';
      this.dom.runTestsBtn.disabled = true;

      const summary = await global.MansplainerTestRunner.runAll({
        onTestPass: (name) => {
          const li = document.createElement('li');
          li.className = 'test-item pass';
          li.innerHTML = `<span>✔ ${name}</span><span class="test-badge pass">PASS</span>`;
          this.dom.testList.appendChild(li);
        },
        onTestFail: (name, error) => {
          const li = document.createElement('li');
          li.className = 'test-item fail';
          li.innerHTML = `<span>✖ ${name} <small style="color:#f87171;">(${error})</small></span><span class="test-badge fail">FAIL</span>`;
          this.dom.testList.appendChild(li);
        }
      });

      this.dom.runTestsBtn.disabled = false;
      this.dom.testSummaryBar.textContent = `Completed ${summary.total} tests: ${summary.passed} PASSED, ${summary.failed} FAILED (${Math.round((summary.passed / summary.total) * 100)}% coverage).`;
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    global.appInstance = new MansplainerApp();
  });
})(typeof window !== 'undefined' ? window : this);
