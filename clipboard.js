/**
 * Mansplainer Clipboard Workflow Module
 * Handles secure system clipboard reads, automatic writes, feedback triggers,
 * and fallback mechanisms for environments with restricted navigator.clipboard permissions.
 */

(function (global) {
  'use strict';

  const ClipboardHandler = {
    /**
     * Reads text from system clipboard.
     * @returns {Promise<{success: boolean, text?: string, error?: string}>}
     */
    async readText() {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        return {
          success: false,
          error: 'Clipboard API read access is not supported or permitted in this browser context.'
        };
      }

      try {
        // If permission API is supported, check status gracefully
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const perm = await navigator.permissions.query({ name: 'clipboard-read' });
            if (perm.state === 'denied') {
              return { success: false, error: 'Clipboard read permission was denied by browser.' };
            }
          } catch (permErr) {
            // Some browsers reject query for clipboard-read, continue to direct call
          }
        }

        const clipText = await navigator.clipboard.readText();
        return {
          success: true,
          text: clipText || ''
        };
      } catch (err) {
        return {
          success: false,
          error: err.message || 'Failed to read from system clipboard.'
        };
      }
    },

    /**
     * Writes text to system clipboard with fallback for non-secure contexts.
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    async writeText(text) {
      if (!text) return false;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (e) {
          console.warn('navigator.clipboard.writeText failed, attempting fallback...', e);
        }
      }

      // Fallback: execCommand copy
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      } catch (fallbackErr) {
        console.error('All clipboard write attempts failed:', fallbackErr);
        return false;
      }
    }
  };

  global.MansplainerClipboard = ClipboardHandler;
})(typeof window !== 'undefined' ? window : this);
