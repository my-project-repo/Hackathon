/* ==========================================
   LOGICLENS AI MENTOR PANEL — Interactive
========================================== */

const LogicLensChatPanel = {

  panel: null,
  messagesContainer: null,
  statusDot: null,
  statusText: null,

  isMinimized: false,

  _readyPromise: null,
  _readyResolve: null,

  /* Active tab per section group */
  _activeTabIndex: 0,
  _currentResults: [],

  /* ==========================================
     INIT
  ========================================== */

  async init() {

    if (document.getElementById("logiclens-chat-panel")) {
      this.setupElements();
      if (this._readyResolve) this._readyResolve();
      return;
    }

    if (!this._readyPromise) {
      this._readyPromise = new Promise((resolve) => {
        this._readyResolve = resolve;
      });
    }

    await this.injectStyles();
    await this.injectHTML();
    this.setupElements();
    this.attachEventListeners();

    if (this._readyResolve) this._readyResolve();
  },

  /* ==========================================
     READY
  ========================================== */

  async waitUntilReady() {
    if (!this._readyPromise) {
      await this.init();
      return;
    }
    await this._readyPromise;
    this._ensureElements();
  },

  /* ==========================================
     ENSURE DOM
  ========================================== */

  _ensureElements() {
    if (!this.panel)
      this.panel = document.getElementById("logiclens-chat-panel");
    if (!this.messagesContainer)
      this.messagesContainer = document.getElementById("logiclens-messages");
    if (!this.statusDot)
      this.statusDot = document.getElementById("ll-status-dot");
    if (!this.statusText)
      this.statusText = document.getElementById("ll-status-text");
  },

  /* ==========================================
     HTML INJECTION
  ========================================== */

  async injectHTML() {
    if (document.getElementById("logiclens-chat-panel")) return;
    try {
      const htmlURL = chrome.runtime.getURL("ui/chat-panel.html");
      const response = await fetch(htmlURL);
      const html = await response.text();
      document.body.insertAdjacentHTML("beforeend", html);
    } catch (error) {
      console.error("LogicLens HTML Injection Failed", error);
    }
  },

  /* ==========================================
     CSS INJECTION
  ========================================== */

  async injectStyles() {
    if (document.getElementById("logiclens-styles")) return;
    const link = document.createElement("link");
    link.id = "logiclens-styles";
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("ui/chat-panel.css");
    document.head.appendChild(link);
  },

  /* ==========================================
     SETUP ELEMENTS
  ========================================== */

  setupElements() {
    this.panel = document.getElementById("logiclens-chat-panel");
    this.messagesContainer = document.getElementById("logiclens-messages");
    this.statusDot = document.getElementById("ll-status-dot");
    this.statusText = document.getElementById("ll-status-text");
  },

  /* ==========================================
     ATTACH GLOBAL EVENTS
  ========================================== */

  attachEventListeners() {

    const closeBtn = document.getElementById("logiclens-close-btn");
    const minimizeBtn = document.getElementById("logiclens-minimize-btn");

    closeBtn?.addEventListener("click", () => this.hide());
    minimizeBtn?.addEventListener("click", () => this.toggle());

    /* ==========================================
       EVENT DELEGATION — handles all dynamic
       elements in the messages container
    ========================================== */
    document.addEventListener("click", (e) => {

      /* TAB CLICKS */
      const tab = e.target.closest(".ll-err-tab");
      if (tab) {
        const idx = parseInt(tab.dataset.index, 10);
        if (!isNaN(idx)) this._switchTab(idx);
        return;
      }

      /* TOGGLE SECTION CLICKS */
      const toggle = e.target.closest(".ll-expandable-toggle");
      if (toggle) {
        this._toggleSection(toggle);
        return;
      }

    });

  },

  /* ==========================================
     MAIN RENDER
  ========================================== */

  async displayResults(results = []) {

    await this.waitUntilReady();
    this._ensureElements();

    if (!this.messagesContainer) return;

    this._currentResults = results;
    this._activeTabIndex = 0;

    this.messagesContainer.innerHTML = "";

    if (results.length === 0) {
      this.renderSuccessState();
      return;
    }

    this.updateErrorCount(results.length);
    this.updateScore(results);
    this.updateStatus("error");

    /* Render tab bar once at the top */
    const tabBar = document.createElement("div");
    tabBar.id = "ll-global-tabs";
    tabBar.className = "ll-section ll-tabs-section";
    tabBar.innerHTML = this._generateTabs(results);
    this.messagesContainer.appendChild(tabBar);

    /* Render all error panels; only the first is visible */
    results.forEach((result, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "ll-section ll-error-panel";
      wrapper.id = `ll-panel-${index}`;
      wrapper.style.display = index === 0 ? "block" : "none";
      wrapper.innerHTML = this._generateErrorPanel(result, index);
      this.messagesContainer.appendChild(wrapper);
    });

    this.scrollToBottom();

  },

  /* ==========================================
     TAB SWITCH
  ========================================== */

  _switchTab(index) {

    if (index === this._activeTabIndex) return;

    /* Animate out current panel */
    const currentPanel = document.getElementById(`ll-panel-${this._activeTabIndex}`);
    if (currentPanel) {
      currentPanel.classList.add("ll-panel-exit");
      setTimeout(() => {
        currentPanel.style.display = "none";
        currentPanel.classList.remove("ll-panel-exit");
      }, 200);
    }

    this._activeTabIndex = index;

    /* Update tab highlight */
    document.querySelectorAll(".ll-err-tab").forEach((t, i) => {
      t.classList.toggle("active", i === index);
    });

    /* Animate in new panel */
    setTimeout(() => {
      const nextPanel = document.getElementById(`ll-panel-${index}`);
      if (nextPanel) {
        nextPanel.style.display = "block";
        nextPanel.classList.add("ll-panel-enter");
        setTimeout(() => nextPanel.classList.remove("ll-panel-enter"), 300);
      }
    }, 210);

  },

  /* ==========================================
     TOGGLE EXPANDABLE SECTION
  ========================================== */

  _toggleSection(toggleEl) {

    const targetId = toggleEl.dataset.target;
    if (!targetId) return;

    const content = document.getElementById(targetId);
    if (!content) return;

    const isOpen = content.classList.contains("visible");
    const chevron = toggleEl.querySelector(".ll-chevron");

    if (isOpen) {
      content.style.maxHeight = content.scrollHeight + "px";
      requestAnimationFrame(() => {
        content.style.maxHeight = "0";
        content.classList.remove("visible");
        if (chevron) chevron.style.transform = "rotate(0deg)";
      });
    } else {
      content.classList.add("visible");
      content.style.maxHeight = "0";
      requestAnimationFrame(() => {
        content.style.maxHeight = content.scrollHeight + 40 + "px";
        if (chevron) chevron.style.transform = "rotate(180deg)";
      });
      setTimeout(() => {
        content.style.maxHeight = "none";
      }, 350);
    }

  },

  /* ==========================================
     SUCCESS STATE
  ========================================== */

  renderSuccessState() {

    this.messagesContainer.innerHTML = `
      <div class="ll-section">
        <div class="ll-success-card">
          <div class="ll-success-icon">✓</div>
          <div class="ll-success-title">NO LOGIC ISSUES DETECTED</div>
          <div class="ll-success-desc">
            Your code currently matches no LogicLens warning patterns.<br><br>
            Try edge cases and complexity optimization next.
          </div>
        </div>
      </div>
    `;

    this.updateErrorCount(0);
    this.updateStatus("success");
    this.updateScore([]);

  },

  /* ==========================================
     GENERATE TABS
  ========================================== */

  _generateTabs(results) {
    return `
      <div class="ll-section-label">DETECTED ERRORS</div>
      <div class="ll-error-tabs">
        ${results.map((r, i) => `
          <button
            class="ll-err-tab ${i === 0 ? "active" : ""}"
            data-index="${i}"
            title="${this.escapeHtml(r.message || r.type || 'Error')}"
          >
            ${this.escapeHtml(r.type || "ERR")}
          </button>
        `).join("")}
      </div>
    `;
  },

  /* ==========================================
     GENERATE FULL ERROR PANEL
  ========================================== */

  _generateErrorPanel(result, index) {

    const severity = result.severity || "warning";
    const panelId = `panel-${index}`;

    return `

      <!-- ERROR CARD -->
      <div class="ll-error-card ${severity}">
        <div class="ll-error-type">${this.escapeHtml(result.message || "Logic Error")}</div>
        <div class="ll-error-desc">${this.escapeHtml(result.explanation || "")}</div>
        <div class="ll-error-loc">
          <span class="ll-error-loc-badge">${this.escapeHtml(result.type || "AST")}</span>
        </div>
      </div>

      <!-- VISUALIZATION -->
      ${this._generateVisualization(result, panelId)}

      <!-- CS CONCEPT (expandable) -->
      ${this._generateConceptSection(result, panelId)}

      <!-- SUGGESTED FIX (expandable) -->
      ${this._generateFixSection(result, panelId)}

    `;

  },

  /* ==========================================
     VISUALIZATION
  ========================================== */

  _generateVisualization(result, panelId) {

    if (result.type === "OFF_BY_ONE") {
      return `
        <div class="ll-section-label">// EXECUTION VISUALIZATION</div>
        <div class="ll-array-viz">
          <div class="ll-array-meta">arr = [2, 7, 11, 15]</div>
          <div class="array-label-row">
            <div class="ll-idx-label">idx 0</div>
            <div class="ll-idx-label">idx 1</div>
            <div class="ll-idx-label">idx 2</div>
            <div class="ll-idx-label">idx 3</div>
            <div class="ll-idx-label error-idx">idx 4 !</div>
          </div>
          <div class="array-row">
            <div class="ll-array-cell">2</div>
            <div class="ll-array-cell">7</div>
            <div class="ll-array-cell">11</div>
            <div class="ll-array-cell">15</div>
            <div class="ll-ghost-cell">?</div>
          </div>
          <div class="ll-viz-annotation">
            Loop reaches invalid index because <code>i &lt;= arr.length</code>.<br>
            Safe condition: <code>i &lt; arr.length</code>
          </div>
        </div>
      `;
    }

    if (result.type === "INFINITE_LOOP" || result.type === "POSSIBLE_INFINITE_LOOP") {
      return `
        <div class="ll-section-label">// LOOP TRACE</div>
        <div class="ll-loop-trace">
          <div class="ll-loop-header">
            <span class="ll-loop-badge">ITER ∞</span>
            <span class="ll-loop-status-text">never exits</span>
          </div>
          <div class="ll-loop-bar-track">
            <div class="ll-loop-bar-fill"></div>
          </div>
          <div class="ll-loop-hint">Loop condition variables are never updated — the condition never becomes false.</div>
        </div>
      `;
    }

    return "";

  },

  /* ==========================================
     CS CONCEPT SECTION (expandable)
  ========================================== */

  _generateConceptSection(result, panelId) {

    if (!result.concept && !result.topic) return "";

    const id = `concept-${panelId}`;

    return `
      <div class="ll-section-label">CS CONCEPT MAPPING</div>
      <div class="ll-expandable-card">
        <button class="ll-expandable-toggle" data-target="${id}">
          <div class="ll-expandable-toggle-left">
            <span class="ll-concept-icon">📘</span>
            <span class="ll-concept-name">${this.escapeHtml(result.concept || "Programming Concept")}</span>
          </div>
          <span class="ll-chevron">▾</span>
        </button>
        <div class="ll-expandable-content" id="${id}">
          <div class="ll-concept-body">${this.escapeHtml(result.learningHint || "")}</div>
          ${result.topic ? `<div class="ll-concept-rule">${this.escapeHtml(result.topic)}</div>` : ""}
        </div>
      </div>
    `;

  },

  /* ==========================================
     FIX SECTION (expandable)
  ========================================== */

  _generateFixSection(result, panelId) {

    if (!result.exampleFix) return "";

    const id = `fix-${panelId}`;

    return `
      <div class="ll-section-label">// SUGGESTED FIX</div>
      <div class="ll-expandable-card fix-card">
        <button class="ll-expandable-toggle" data-target="${id}">
          <div class="ll-expandable-toggle-left">
            <span class="ll-fix-icon">✓</span>
            <span class="ll-fix-toggle-label">SHOW CORRECTED LOGIC</span>
          </div>
          <span class="ll-chevron">▾</span>
        </button>
        <div class="ll-expandable-content" id="${id}">
          <div class="ll-fix-code">${this.escapeHtml(result.exampleFix)}</div>
        </div>
      </div>
    `;

  },

  /* ==========================================
     ERROR COUNT
  ========================================== */

  updateErrorCount(count = 0) {
    const countEl = document.getElementById("logiclens-error-count");
    if (!countEl) return;
    countEl.textContent = `${count} ERROR${count !== 1 ? "S" : ""}`;
    countEl.className = "analysis-count" + (count > 0 ? " has-errors" : "");
  },

  /* ==========================================
     SCORE
  ========================================== */

  updateScore(results) {
    const fill = document.getElementById("ll-score-fill");
    const value = document.getElementById("ll-score-val");
    if (!fill || !value) return;

    const score = Math.max(0, 100 - (results.length * 12));
    fill.style.width = `${score}%`;
    value.textContent = `${score}%`;
  },

  /* ==========================================
     STATUS
  ========================================== */

  updateStatus(type = "success") {
    this._ensureElements();
    if (!this.statusDot || !this.statusText) return;

    this.statusDot.className = "status-dot";

    if (type === "error") {
      this.statusDot.classList.add("error");
      this.statusText.textContent = "Logic issues detected";
    } else if (type === "warning") {
      this.statusDot.classList.add("analyzing");
      this.statusText.textContent = "Analyzing...";
    } else {
      this.statusText.textContent = "Tracking Monaco Editor";
    }
  },

  setAnalyzing() { this.updateStatus("warning"); },
  setReady() { this.updateStatus("success"); },

  /* ==========================================
     CLEAR
  ========================================== */

  clear() {
    if (this.messagesContainer) this.messagesContainer.innerHTML = "";
  },

  /* ==========================================
     SCROLL
  ========================================== */

  scrollToBottom() {
    setTimeout(() => {
      this._ensureElements();
      if (this.messagesContainer) {
        this.messagesContainer.scrollTop = 0; // scroll to top to show tabs first
      }
    }, 0);
  },

  /* ==========================================
     PANEL TOGGLE / SHOW / HIDE
  ========================================== */

  toggle() {
    if (!this.panel) return;
    this.isMinimized = !this.isMinimized;
    this.panel.classList.toggle("minimized");
  },

  show() {
    if (this.panel) this.panel.style.display = "flex";
  },

  hide() {
    if (this.panel) this.panel.style.display = "none";
  },

  /* ==========================================
     ESCAPE HTML
  ========================================== */

  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

};

/* ==========================================
   INIT
========================================== */

LogicLensChatPanel.init();
window.LogicLensChatPanel = LogicLensChatPanel;