/*
==================================================
LogicLens
Realtime Editor Detection + Code Tracking System
==================================================
*/

/* ==================================================
   GLOBAL STATE
================================================== */

const LogicLens = {
  currentEditor: null,
  currentEditorType: null,
  trackingInterval: null,
  observer: null,
  lastCode: "",
  routeCheckInterval: null,
  lastUrl: location.href
};

/* ==================================================
   PLATFORM DETECTION
================================================== */

const SUPPORTED_PLATFORMS = [
  "leetcode.com",
  "hackerrank.com",
  "geeksforgeeks.org",
  "codeforces.com",
  "codechef.com",
  "atcoder.jp"
];

function isSupportedPlatform() {
  return SUPPORTED_PLATFORMS.some(platform =>
    window.location.hostname.includes(platform)
  );
}

function getCurrentPlatform() {
  const host = window.location.hostname;
  if (host.includes("leetcode.com"))      return "leetcode";
  if (host.includes("hackerrank.com"))    return "hackerrank";
  if (host.includes("geeksforgeeks.org")) return "geeksforgeeks";
  if (host.includes("codeforces.com"))    return "codeforces";
  if (host.includes("codechef.com"))      return "codechef";
  if (host.includes("atcoder.jp"))        return "atcoder";
  return "unknown";
}

/* ==================================================
   BADGE SYSTEM
================================================== */

function createBadge() {
  if (document.getElementById("logiclens-badge")) return;

  const badge = document.createElement("div");
  badge.id = "logiclens-badge";
  badge.innerHTML = `
    <div class="logiclens-dot"></div>
    <span id="logiclens-status">LogicLens Active</span>
  `;
  badge.style.display = "none";
  document.body.appendChild(badge);
}

function updateBadge(text) {
  const status = document.getElementById("logiclens-status");
  if (status) status.textContent = text;
}

/* ==================================================
   LOGGING SYSTEM
================================================== */

function log(message, data = "") {
  console.log(
    `%cLogicLens%c ${message}`,
    "color:#4f8cff;font-weight:bold;",
    "color:white;",
    data
  );
}

/* ==================================================
   DEBOUNCE UTILITY
================================================== */

function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/* ==================================================
   LANGUAGE DETECTION — PLATFORM-AWARE
================================================== */

function detectProgrammingLanguage() {

  const platform = getCurrentPlatform();
  const host = window.location.hostname;

  // ==========================================
  // GeeksForGeeks
  // ==========================================
  if (platform === "geeksforgeeks") {

    // GFG uses a <select> or dropdown with class names like
    // "problems_header_select__" or the IDE has a lang picker
    const selectors = [
      "select.problems_header_select__",
      "[class*='problems_header_select']",
      "[class*='languageDropdown']",
      "[class*='lang-select']",
      ".ace_editor", // fallback: try to read from URL or page title
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el.value || el.innerText || "").toLowerCase();
        if (text.includes("javascript") || text.includes("js")) return "javascript";
        if (text.includes("python"))                             return "python";
        if (text.includes("java") && !text.includes("javascript")) return "java";
        if (text.includes("c++") || text.includes("cpp"))       return "cpp";
        if (text === "c")                                        return "c";
      }
    }

    // GFG also exposes lang in URL: ?lang=javascript
    const urlLang = new URLSearchParams(window.location.search).get("lang");
    if (urlLang) {
      const l = urlLang.toLowerCase();
      if (l.includes("javascript")) return "javascript";
      if (l.includes("python"))     return "python";
      if (l.includes("java"))       return "java";
      if (l.includes("cpp") || l.includes("c++")) return "cpp";
    }

    // GFG page meta / breadcrumb often has language name
    const allText = document.body.innerText;
    // look for the selected option in any visible dropdown text
    const langMatch = allText.match(/\b(JavaScript|Python|Java|C\+\+|CPP)\b/i);
    if (langMatch) {
      const l = langMatch[1].toLowerCase();
      if (l === "javascript") return "javascript";
      if (l === "python")     return "python";
      if (l === "java")       return "java";
      if (l === "c++" || l === "cpp") return "cpp";
    }

    return "javascript"; // GFG default is usually C++ but JS is more parseable; let Babel try
  }

  // ==========================================
  // HackerRank
  // ==========================================
  if (platform === "hackerrank") {

    const selectors = [
      ".select-language",
      "[data-key='language']",
      ".language-dropdown",
      "[class*='LanguageSelector']",
      "[class*='language-selector']",
      ".hr-select",
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el.value || el.innerText || el.textContent || "").toLowerCase();
        if (text.includes("javascript")) return "javascript";
        if (text.includes("python"))     return "python";
        if (text.includes("java") && !text.includes("javascript")) return "java";
        if (text.includes("c++") || text.includes("cpp")) return "cpp";
      }
    }

    // HackerRank stores lang in URL hash or query
    const hash = window.location.hash;
    if (hash.includes("javascript")) return "javascript";
    if (hash.includes("python"))     return "python";
    if (hash.includes("java"))       return "java";
    if (hash.includes("cpp"))        return "cpp";

    return "javascript";
  }

  // ==========================================
  // Codeforces
  // ==========================================
  if (platform === "codeforces") {

    const selectors = [
      "select[name='programTypeId']",
      "#programTypeForTag",
      "[name='programTypeId']",
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el.value || el.innerText || "").toLowerCase();
        if (text.includes("javascript") || text.includes("js")) return "javascript";
        if (text.includes("python"))  return "python";
        if (text.includes("java") && !text.includes("javascript")) return "java";
        if (text.includes("c++") || text.includes("cpp")) return "cpp";
        if (text === "c")             return "c";
      }
    }

    // Codeforces shows "GNU G++17" etc in the selected <option>
    const selected = document.querySelector("select[name='programTypeId'] option:checked");
    if (selected) {
      const t = selected.textContent.toLowerCase();
      if (t.includes("javascript")) return "javascript";
      if (t.includes("python"))     return "python";
      if (t.includes("java") && !t.includes("javascript")) return "java";
      if (t.includes("c++") || t.includes("cpp")) return "cpp";
    }

    return "cpp"; // CF default is usually C++
  }

  // ==========================================
  // CodeChef
  // ==========================================
  if (platform === "codechef") {

    const selectors = [
      "#language-select",
      "[id*='language']",
      "[class*='language']",
      "select",
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el.value || el.innerText || "").toLowerCase();
        if (text.includes("javascript")) return "javascript";
        if (text.includes("python"))     return "python";
        if (text.includes("java") && !text.includes("javascript")) return "java";
        if (text.includes("c++") || text.includes("cpp")) return "cpp";
      }
    }

    return "cpp";
  }

  // ==========================================
  // AtCoder
  // ==========================================
  if (platform === "atcoder") {

    const selectors = [
      "#select-lang select",
      "select[name='LanguageId']",
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el.value || el.innerText || "").toLowerCase();
        if (text.includes("javascript")) return "javascript";
        if (text.includes("python"))     return "python";
        if (text.includes("java") && !text.includes("javascript")) return "java";
        if (text.includes("c++") || text.includes("cpp")) return "cpp";
      }
    }

    return "cpp";
  }

  // ==========================================
  // LeetCode (original logic)
  // ==========================================
  const lcSelectors = [
    '[data-cy="lang-select"]',
    '.lang-select',
    'button'
  ];

  for (const selector of lcSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.innerText.toLowerCase();
      if (text.includes("javascript")) return "javascript";
      if (text.includes("python"))     return "python";
      if (text.includes("java") && !text.includes("javascript")) return "java";
      if (text.includes("c++"))        return "cpp";
      if (text === "c")                return "c";
    }
  }

  return "javascript"; // safe fallback — Babel can try
}

/* ==================================================
   EDITOR ADAPTERS
================================================== */

const MonacoAdapter = {

  detect() {
    return (
      document.querySelector(".monaco-editor") ||
      document.querySelector(".view-lines") ||
      window.monaco
    );
  },

  getCode() {
    try {
      if (window.monaco && window.monaco.editor && window.monaco.editor.getModels) {
        const models = window.monaco.editor.getModels();
        if (models.length > 0) return models[0].getValue();
      }
      const viewLines = document.querySelector(".view-lines");
      if (viewLines) return viewLines.innerText;
      return "";
    } catch (error) {
      log("Monaco extraction failed", error);
      return "";
    }
  },

  startTracking() {
    updateBadge("Tracking Code");
    log("Tracking started: Monaco");
    startRealtimeTracking(this);
  }
};

const AceAdapter = {

  detect() {
    return document.querySelector(".ace_editor");
  },

  getCode() {
    try {
      // ==========================================
      // Best method: use Ace's JS API if available
      // window.ace.edit(element) gives clean code
      // ==========================================
      const aceEl = document.querySelector(".ace_editor");
      if (!aceEl) return "";

      // Try the global ace API first (cleanest output, no line numbers)
      if (window.ace) {
        try {
          const editor = window.ace.edit(aceEl);
          if (editor && editor.getValue) {
            const val = editor.getValue();
            if (val && val.trim()) return val;
          }
        } catch (e) {
          // fall through to DOM method
        }
      }

      // ==========================================
      // Fallback: scrape only the code content lines
      // Ace renders lines in .ace_line elements inside
      // .ace_content — these do NOT contain gutter numbers
      // ==========================================
      const content = aceEl.querySelector(".ace_content");
      if (content) {
        const lines = content.querySelectorAll(".ace_line");
        if (lines.length > 0) {
          return Array.from(lines).map(l => l.innerText).join("\n");
        }
        return content.innerText;
      }

      // Last resort: full innerText (sanitizeCode will strip line numbers)
      return aceEl.innerText;

    } catch (error) {
      log("Ace extraction failed", error);
      return "";
    }
  },

  startTracking() {
    updateBadge("Tracking Code");
    log("Tracking started: Ace");
    startRealtimeTracking(this);
  }
};

const CodeMirrorAdapter = {

  detect() {
    return (
      document.querySelector(".cm-editor") ||
      document.querySelector(".CodeMirror")
    );
  },

  getCode() {
    try {
      // ==========================================
      // CodeMirror 6: use CM6 JS API
      // ==========================================
      const cm6 = document.querySelector(".cm-editor");
      if (cm6 && cm6.CodeMirror) {
        return cm6.CodeMirror.state.doc.toString();
      }

      // ==========================================
      // CodeMirror 5: use the .CodeMirror.getValue()
      // ==========================================
      const cm5 = document.querySelector(".CodeMirror");
      if (cm5 && cm5.CodeMirror) {
        return cm5.CodeMirror.getValue();
      }

      // Fallback: scrape .cm-line elements (CM6 DOM)
      const cm6El = document.querySelector(".cm-editor");
      if (cm6El) {
        const lines = cm6El.querySelectorAll(".cm-line");
        if (lines.length > 0) {
          return Array.from(lines).map(l => l.innerText).join("\n");
        }
        return cm6El.innerText;
      }

      const cm5El = document.querySelector(".CodeMirror");
      if (cm5El) return cm5El.innerText;

      return "";
    } catch (error) {
      log("CodeMirror extraction failed", error);
      return "";
    }
  },

  startTracking() {
    updateBadge("Tracking Code");
    log("Tracking started: CodeMirror");
    startRealtimeTracking(this);
  }
};

const TextareaAdapter = {

  detect() {
    return document.querySelector("textarea");
  },

  getCode() {
    try {
      return document.querySelector("textarea")?.value || "";
    } catch (error) {
      log("Textarea extraction failed", error);
      return "";
    }
  },

  startTracking() {
    updateBadge("Tracking Code");
    log("Tracking started: Textarea");
    startRealtimeTracking(this);
  }
};

/* ==================================================
   ADAPTER REGISTRY
================================================== */

const EditorAdapters = [
  MonacoAdapter,
  AceAdapter,
  CodeMirrorAdapter,
  TextareaAdapter
];

/* ==================================================
   REALTIME TRACKING ENGINE
================================================== */

const handleCodeUpdate = debounce((code) => {

  if (!code) return;
  if (code === LogicLens.lastCode) return;

  LogicLens.lastCode = code;

  if (window.LogicLensChatPanel) {
    LogicLensChatPanel.setAnalyzing();
  }

  log("Code updated");

  console.log(
    "%cCURRENT CODE:",
    "color:#00e676;font-weight:bold;",
    code
  );

  // ==========================================
  // SANITIZE + PARSE
  // ==========================================

  code = sanitizeCode(code);

  const language = detectProgrammingLanguage();

  console.log(
    "%cDetected Language:",
    "color:#03a9f4;font-weight:bold;",
    language
  );

  let ast = null;

  if (language === "javascript") {
    ast = parseJavaScript(code);
  } else if (language === "java") {
    ast = parseJava(code);
  } else if (language === "python") {
    ast = parsePython(code);
  } else {
    // For cpp/c/unknown — try JavaScript parser as a last resort
    // (catches common algorithmic patterns written in JS-like syntax)
    ast = parseJavaScript(code);
  }

  console.log(
    "%cAST RESULT:",
    "color:#ff9800;font-weight:bold;",
    ast
  );

  if (!ast) {
    console.warn("LogicLens: Waiting for valid syntax...");
    if (window.LogicLensChatPanel) {
      LogicLensChatPanel.displayResults([
        {
          type: "PARSING",
          severity: "warning",
          message: "Waiting for valid syntax...",
          explanation:
            "Complete the current code block to continue realtime AST analysis.",
          suggestion:
            "Finish typing brackets, conditions, or statements."
        }
      ]);
    }
    return;
  }

  const symbolTable = buildSymbolTable(ast);

  console.log(
    "%cSYMBOL TABLE:",
    "color:#ff9800;font-weight:bold;",
    symbolTable
  );

  const detectedPatterns = classifyPatterns(ast);

  console.log(
    "%cPATTERN CLASSIFIER:",
    "color:#e91e63;font-weight:bold;",
    detectedPatterns
  );

  const inferredType = inferType(
    ast.program.body?.[0],
    symbolTable
  );

  console.log(
    "%cTYPE INFERENCE TEST:",
    "color:#03a9f4;font-weight:bold;",
    inferredType
  );

  // ==========================================
  // CENTRALIZED DETECTION LOGGER
  // ==========================================

  function logDetectionResults(results) {
    if (!Array.isArray(results)) return [];
    results.forEach((result) => {
      console.warn(
        "%cLOGICLENS DETECTION:",
        "color:#ff1744;font-weight:bold;",
        result.message
      );
      console.log(
        "%cEXPLANATION:",
        "color:#00bcd4;font-weight:bold;",
        result.explanation
      );
      console.log(
        "%cSUGGESTION:",
        "color:#8bc34a;font-weight:bold;",
        result.suggestion
      );
    });
    return results;
  }

  // ==========================================
  // RUN ALL RULES
  // ==========================================

  const detections = [
    ...detectOffByOne(ast),
    ...detectInfiniteLoop(ast),
    ...detectMissingBaseCase(ast),
    ...detectNullAccess(ast),
    ...detectAssignmentInCondition(ast),
    ...detectUnreachableCode(ast),
    ...detectEmptyLoopBody(ast),
    ...detectApiMisuse(ast, language),
    ...detectArrayMutationDuringIteration(ast),
    ...detectMissingReturn(ast),
    ...detectFloatingPointEquality(ast),
    ...detectStackOverflowRisk(ast),
    ...detectDuplicateConditions(ast),
    ...detectMissingEdgeCaseHandling(ast),
    ...detectSlidingWindowNotShrinking(ast),
    ...detectDPStateOverwrite(ast),
    ...detectBinarySearchMidOverflow(ast),
    ...detectModuloByZeroRisk(ast),
    ...detectMissingHashMapExistenceCheck(ast),
    ...detectIncorrectLoopUpdate(ast)
  ];

  logDetectionResults(detections);

  if (window.LogicLensChatPanel) {
    window.LogicLensChatPanel.displayResults(detections);
  }

  // ==========================================
  // AI ANALYSIS — runs in parallel after static
  // rules, debounced 2.5s to avoid spamming API
  // ==========================================

  if (typeof LogicLensAI !== "undefined") {
    LogicLensAI.analyze(code, language, detections);
  }

}, 500);

function startRealtimeTracking(adapter) {
  cleanupTracking();
  LogicLens.currentEditor = adapter;

  LogicLens.trackingInterval = setInterval(() => {
    const code = adapter.getCode();
    handleCodeUpdate(code);
  }, 1000);
}

/* ==================================================
   CLEANUP SYSTEM
================================================== */

function cleanupTracking() {
  if (LogicLens.trackingInterval) {
    clearInterval(LogicLens.trackingInterval);
    LogicLens.trackingInterval = null;
  }
}

/* ==================================================
   EDITOR DETECTION ENGINE
================================================== */

function detectEditor() {
  log("Searching for editor...");

  for (const adapter of EditorAdapters) {
    if (adapter.detect()) {

      const editorName =
        adapter === MonacoAdapter    ? "Monaco"    :
        adapter === AceAdapter       ? "Ace"       :
        adapter === CodeMirrorAdapter? "CodeMirror":
                                       "Textarea";

      if (LogicLens.currentEditorType === editorName) return;

      LogicLens.currentEditorType = editorName;
      updateBadge("Editor Detected");
      log(`${editorName} detected`);
      adapter.startTracking();
      return;
    }
  }
}

/* ==================================================
   MUTATION OBSERVER
================================================== */

function startDOMObserver() {
  if (LogicLens.observer) {
    LogicLens.observer.disconnect();
  }

  LogicLens.observer = new MutationObserver(
    debounce(() => { detectEditor(); }, 500)
  );

  LogicLens.observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  log("MutationObserver attached");
}

/* ==================================================
   SPA ROUTE CHANGE HANDLING
================================================== */

function monitorRouteChanges() {
  LogicLens.routeCheckInterval = setInterval(() => {
    if (location.href !== LogicLens.lastUrl) {
      log("Route changed");
      LogicLens.lastUrl = location.href;
      LogicLens.currentEditorType = null;
      cleanupTracking();
      setTimeout(() => { detectEditor(); }, 1500);
    }
  }, 1000);
}

/* ==================================================
   INITIALIZATION
================================================== */

function initializeLogicLens() {
  if (!isSupportedPlatform()) {
    log("Unsupported platform");
    return;
  }

  log("LogicLens Loaded");

  createBadge();

  if (window.LogicLensChatPanel) {
    LogicLensChatPanel.init();
  }

  detectEditor();
  startDOMObserver();
  monitorRouteChanges();
}

/* ==================================================
   START EXTENSION
================================================== */

window.addEventListener("load", () => {
  initializeLogicLens();
});