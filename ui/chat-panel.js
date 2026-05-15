/* ==========================================
   LogicLens Chat Panel Manager
========================================== */

const LogicLensChatPanel = {
  panel: null,
  messagesContainer: null,
  statusDot: null,
  statusText: null,
  isMinimized: false,

  // Initialize the chat panel
  init() {
    // Inject HTML directly
    this.injectHTML();
    // Wait a bit for DOM to update, then setup
    setTimeout(() => {
      this.setupElements();
      this.attachEventListeners();
      this.injectStyles();
    }, 100);
  },

  // Inject chat panel HTML
  injectHTML() {
    const panelHTML = `
      <!-- LogicLens Chat Panel UI -->
      <div id="logiclens-chat-panel" class="logiclens-chat-panel">
        <!-- Header -->
        <div class="logiclens-chat-header">
          <div class="logiclens-chat-title">
            <svg class="logiclens-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4M12 16h.01"></path>
            </svg>
            <span>LogicLens</span>
          </div>
          <div class="logiclens-chat-controls">
            <button id="logiclens-minimize-btn" class="logiclens-btn" title="Minimize">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button id="logiclens-close-btn" class="logiclens-btn" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Code Input Area -->
        <div class="logiclens-code-input-section">
          <textarea id="logiclens-code-input" class="logiclens-code-textarea" placeholder="Paste your code here to analyze..."></textarea>
          <button id="logiclens-analyze-btn" class="logiclens-analyze-button">Analyze</button>
        </div>

        <!-- Messages Container -->
        <div class="logiclens-chat-messages" id="logiclens-messages">
          <div class="logiclens-welcome-message">
            <div class="logiclens-welcome-icon">💡</div>
            <div class="logiclens-welcome-text">
              <h3>Welcome to LogicLens</h3>
              <p>Paste your code above or write in the editor to get realtime DSA mentoring and bug detection.</p>
            </div>
          </div>
        </div>

        <!-- Status Indicator -->
        <div class="logiclens-chat-status" id="logiclens-status-indicator">
          <div class="logiclens-status-dot"></div>
          <span id="logiclens-status-text">Ready</span>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', panelHTML);
  },

  // Setup DOM element references
  setupElements() {
    this.panel = document.getElementById('logiclens-chat-panel');
    this.messagesContainer = document.getElementById('logiclens-messages');
    this.statusDot = document.querySelector('.logiclens-status-dot');
    this.statusText = document.getElementById('logiclens-status-text');
  },

  // Attach event listeners
  attachEventListeners() {
    const closeBtn = document.getElementById('logiclens-close-btn');
    const minimizeBtn = document.getElementById('logiclens-minimize-btn');
    const analyzeBtn = document.getElementById('logiclens-analyze-btn');
    const codeInput = document.getElementById('logiclens-code-input');

    closeBtn?.addEventListener('click', () => this.hide());
    minimizeBtn?.addEventListener('click', () => this.toggle());
    analyzeBtn?.addEventListener('click', () => this.analyzeCode());
    
    // Auto-analyze on paste with slight delay
    codeInput?.addEventListener('paste', () => {
      setTimeout(() => this.analyzeCode(), 100);
    });
  },

  // Inject the CSS
  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
/* ==========================================
   LogicLens Chat Panel Styles
========================================== */

.logiclens-chat-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 420px;
  height: 700px;
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  z-index: 999999;
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  animation: logiclensSlideIn 0.3s ease-out;
}

@keyframes logiclensSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
}

/* ==========================================
   Header
========================================== */

.logiclens-chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid #3e3e42;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #252526;
}

.logiclens-chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cccccc;
  font-weight: 600;
  font-size: 14px;
}

.logiclens-icon {
  width: 18px;
  height: 18px;
  color: #00bcd4;
}

.logiclens-chat-controls {
  display: flex;
  gap: 4px;
}

.logiclens-btn {
  background: transparent;
  border: none;
  color: #cccccc;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.logiclens-btn:hover {
  background: #3e3e42;
  color: #ffffff;
}

.logiclens-btn svg {
  width: 16px;
  height: 16px;
}

/* ==========================================
   Messages Container
========================================== */

.logiclens-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #1e1e1e;
}

/* Scrollbar Styling */
.logiclens-chat-messages::-webkit-scrollbar {
  width: 8px;
}

.logiclens-chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.logiclens-chat-messages::-webkit-scrollbar-thumb {
  background: #424245;
  border-radius: 4px;
}

.logiclens-chat-messages::-webkit-scrollbar-thumb:hover {
  background: #4e4e52;
}

/* ==========================================
   Welcome Message
========================================== */

.logiclens-welcome-message {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #2d2d30;
  border-radius: 6px;
  border-left: 3px solid #00bcd4;
}

.logiclens-welcome-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.logiclens-welcome-text h3 {
  margin: 0 0 6px 0;
  color: #cccccc;
  font-size: 13px;
  font-weight: 600;
}

.logiclens-welcome-text p {
  margin: 0;
  color: #a8a8a8;
  font-size: 12px;
  line-height: 1.4;
}

/* ==========================================
   Error Message Card
========================================== */

.logiclens-message {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #2d2d30;
  border-radius: 6px;
  border-left: 3px solid;
  animation: logiclensMessageSlide 0.3s ease-out;
}

@keyframes logiclensMessageSlide {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Message Types */
.logiclens-message.error {
  border-left-color: #f48771;
}

.logiclens-message.warning {
  border-left-color: #dcdcaa;
}

.logiclens-message.info {
  border-left-color: #4ec9b0;
}

.logiclens-message.success {
  border-left-color: #6a9955;
}

.logiclens-message-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border-radius: 50%;
}

.logiclens-message.error .logiclens-message-icon {
  background: rgba(244, 135, 113, 0.2);
  color: #f48771;
}

.logiclens-message.warning .logiclens-message-icon {
  background: rgba(220, 220, 170, 0.2);
  color: #dcdcaa;
}

.logiclens-message.info .logiclens-message-icon {
  background: rgba(78, 201, 176, 0.2);
  color: #4ec9b0;
}

.logiclens-message.success .logiclens-message-icon {
  background: rgba(106, 153, 85, 0.2);
  color: #6a9955;
}

.logiclens-message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logiclens-message-title {
  color: #cccccc;
  font-weight: 600;
  font-size: 13px;
}

.logiclens-message-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logiclens-message-label {
  color: #969696;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.logiclens-message-text {
  color: #a8a8a8;
  font-size: 12px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.logiclens-code-block {
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  padding: 8px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  color: #d4d4d4;
}

/* ==========================================
   Expandable Sections
========================================== */

.logiclens-section-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #007acc;
  font-size: 12px;
  user-select: none;
  transition: color 0.2s ease;
}

.logiclens-section-toggle:hover {
  color: #1ba1e2;
}

.logiclens-section-toggle-arrow {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  font-size: 10px;
}

.logiclens-section-toggle-arrow.collapsed {
  transform: rotate(-90deg);
}

.logiclens-section-content {
  display: none;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #3e3e42;
}

.logiclens-section-content.visible {
  display: block;
}

/* ==========================================
   Status Indicator
========================================== */

.logiclens-chat-status {
  padding: 10px 16px;
  border-top: 1px solid #3e3e42;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #a8a8a8;
  background: #252526;
}

.logiclens-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6a9955;
  animation: logiclens-pulse 1.5s infinite;
}

.logiclens-status-dot.analyzing {
  background: #dcdcaa;
  animation: logiclens-pulse 1s infinite;
}

.logiclens-status-dot.error {
  background: #f48771;
  animation: logiclens-pulse-alert 0.6s infinite;
}

@keyframes logiclens-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes logiclens-pulse-alert {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* ==========================================
   Minimize State
========================================== */

.logiclens-chat-panel.minimized {
  height: 48px;
}

.logiclens-chat-panel.minimized .logiclens-code-input-section,
.logiclens-chat-panel.minimized .logiclens-chat-messages,
.logiclens-chat-panel.minimized .logiclens-chat-status {
  display: none;
}

/* ==========================================
   Code Input Section
========================================== */

.logiclens-code-input-section {
  padding: 12px;
  border-bottom: 1px solid #3e3e42;
  background: #252526;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logiclens-code-textarea {
  width: 100%;
  height: 80px;
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  padding: 8px;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.logiclens-code-textarea:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 1px #007acc;
}

.logiclens-code-textarea::placeholder {
  color: #6a6a6a;
}

.logiclens-analyze-button {
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logiclens-analyze-button:hover {
  background: #1084d7;
}

.logiclens-analyze-button:active {
  background: #0060b0;
}

/* ==========================================
   Mobile Responsive
========================================== */

@media (max-width: 600px) {
  .logiclens-chat-panel {
    width: calc(100vw - 40px);
    height: calc(100vh - 100px);
    max-width: 400px;
  }
}
    `;
    document.head.appendChild(style);
  },

  // Display a detection result message
  displayMessage(result) {
    if (!this.messagesContainer) return;

    // Remove welcome message if this is the first error
    const welcomeMsg = this.messagesContainer.querySelector('.logiclens-welcome-message');
    if (welcomeMsg && this.messagesContainer.children.length === 1) {
      welcomeMsg.remove();
    }

    // Determine message type
    const messageType = result.severity || 'error';

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `logiclens-message ${messageType}`;

    // Icon mapping
    const icons = {
      error: '⚠️',
      warning: '⚡',
      info: 'ℹ️',
      success: '✓'
    };

    // Build message content
    let content = `
      <div class="logiclens-message-icon">${icons[messageType]}</div>
      <div class="logiclens-message-content">
        <div class="logiclens-message-title">${this.escapeHtml(result.message)}</div>
    `;

    // Add explanation
    if (result.explanation) {
      content += `
        <div class="logiclens-message-field">
          <div class="logiclens-message-label">Explanation</div>
          <div class="logiclens-message-text">${this.escapeHtml(result.explanation)}</div>
        </div>
      `;
    }

    // Add suggestion
    if (result.suggestion) {
      content += `
        <div class="logiclens-message-field">
          <div class="logiclens-message-label">Suggestion</div>
          <div class="logiclens-message-text">${this.escapeHtml(result.suggestion)}</div>
        </div>
      `;
    }

    // Add example fix
    if (result.exampleFix) {
      content += `
        <div class="logiclens-message-field">
          <div class="logiclens-section-toggle" onclick="
            const section = this.parentElement.querySelector('.logiclens-section-content');
            const arrow = this.querySelector('.logiclens-section-toggle-arrow');
            section.classList.toggle('visible');
            arrow.classList.toggle('collapsed');
          ">
            <span class="logiclens-section-toggle-arrow">▶</span>
            <span>Show Example Fix</span>
          </div>
          <div class="logiclens-section-content">
            <div class="logiclens-code-block">${this.escapeHtml(result.exampleFix)}</div>
          </div>
        </div>
      `;
    }

    // Add learning hint
    if (result.learningHint) {
      content += `
        <div class="logiclens-message-field">
          <div class="logiclens-message-label">Learning Hint</div>
          <div class="logiclens-message-text">${this.escapeHtml(result.learningHint)}</div>
        </div>
      `;
    }

    // Add concept and topic
    if (result.concept || result.topic) {
      let metadata = '';
      if (result.concept) {
        metadata += `<strong>Concept:</strong> ${this.escapeHtml(result.concept)}<br>`;
      }
      if (result.topic) {
        metadata += `<strong>Topic:</strong> ${this.escapeHtml(result.topic)}`;
      }
      content += `
        <div class="logiclens-message-field">
          <div class="logiclens-message-label">Related Concepts</div>
          <div class="logiclens-message-text">${metadata}</div>
        </div>
      `;
    }

    content += '</div>';
    messageEl.innerHTML = content;

    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
    this.updateStatus(messageType);
  },

  // Display multiple detection results
  displayResults(results) {
    if (!Array.isArray(results) || results.length === 0) return;

    results.forEach(result => {
      // Add severity level if not present
      if (!result.severity) {
        result.severity = result.message?.includes('Error') ? 'error' : 'warning';
      }
      this.displayMessage(result);
    });
  },

  // Update status indicator
  updateStatus(messageType) {
    if (!this.statusDot || !this.statusText) return;

    const statusMap = {
      error: { dot: 'error', text: 'Issues found' },
      warning: { dot: 'analyzing', text: 'Warnings found' },
      info: { dot: 'analyzing', text: 'Analyzing...' },
      success: { dot: 'success', text: 'All clear' }
    };

    const status = statusMap[messageType] || statusMap.info;
    this.statusDot.className = `logiclens-status-dot ${status.dot}`;
    this.statusText.textContent = status.text;
  },

  // Set analyzing state
  setAnalyzing() {
    if (this.statusDot && this.statusText) {
      this.statusDot.className = 'logiclens-status-dot analyzing';
      this.statusText.textContent = 'Analyzing code...';
    }
  },

  // Set ready state
  setReady() {
    if (this.statusDot && this.statusText) {
      this.statusDot.className = 'logiclens-status-dot';
      this.statusText.textContent = 'Ready';
    }
  },

  // Analyze code from textarea
  analyzeCode() {
    const codeInput = document.getElementById('logiclens-code-input');
    if (!codeInput || !codeInput.value.trim()) {
      alert('Please paste some code first');
      return;
    }

    // Clear previous messages
    this.clear();
    this.setAnalyzing();

    // Trigger code update with pasted code
    const code = codeInput.value;
    
    // Use window's global code analysis function if available
    setTimeout(() => {
      // Post a message to content script to analyze the code
      if (window.__analyzeCode) {
        window.__analyzeCode(code);
      } else {
        // Fallback: try to call handleCodeUpdate directly
        console.log('Analyzing pasted code:', code);
        this.setReady();
      }
    }, 100);
  },

  // Scroll to bottom of messages
  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    }, 0);
  },

  // Toggle minimize
  toggle() {
    if (this.panel) {
      this.isMinimized = !this.isMinimized;
      this.panel.classList.toggle('minimized');
    }
  },

  // Show panel
  show() {
    if (this.panel) {
      this.panel.style.display = 'flex';
    }
  },

  // Hide panel
  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
  },

  // Clear all messages
  clear() {
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = `
        <div class="logiclens-welcome-message">
          <div class="logiclens-welcome-icon">💡</div>
          <div class="logiclens-welcome-text">
            <h3>Welcome to LogicLens</h3>
            <p>Write or paste your code to get realtime DSA mentoring and bug detection.</p>
          </div>
        </div>
      `;
    }
    this.setReady();
  },

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// Initialize chat panel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    LogicLensChatPanel.init();
  });
} else {
  LogicLensChatPanel.init();
}
