/*
==================================================
LogicLens — AI Analyzer (Groq API)
Runs alongside static rules to catch errors
the 20 hardcoded rules can't detect.
==================================================
*/
const LogicLensAI = {

  _debounceTimer: null,
  DEBOUNCE_MS: 2500,

  /* ==========================================
     MAIN ENTRY — call this from content.js
     after static rules run.
  ========================================== */

  analyze(code, language, staticDetections) {

    clearTimeout(this._debounceTimer);

    this._debounceTimer = setTimeout(() => {
      this._run(code, language, staticDetections);
    }, this.DEBOUNCE_MS);

  },

  /* ==========================================
     INTERNAL — builds prompt + calls Groq
  ========================================== */

  async _run(code, language, staticDetections) {

    if (!code || code.trim().length < 20) return;

    if (typeof LOGICLENS_GROQ_KEY === "undefined" || !LOGICLENS_GROQ_KEY) {
      console.warn("LogicLens AI: No Groq API key found. Set LOGICLENS_GROQ_KEY in config.js");
      return;
    }

    // ==========================================
    // Show thinking indicator
    // ==========================================

    if (window.LogicLensChatPanel) {
      window.LogicLensChatPanel.showAIThinking();
    }

    // ==========================================
    // Build system prompt
    // ==========================================

    const alreadyFound = staticDetections.length > 0
      ? `The following errors were already detected by static rules — DO NOT repeat them:\n` +
        staticDetections.map(d => `- ${d.type}: ${d.message}`).join("\n")
      : "No static errors were found yet.";

    const systemPrompt = `You are an expert competitive programming mentor analyzing ${language} code for logic bugs and DSA mistakes.

${alreadyFound}

Your job is to find NEW errors NOT already detected. Focus on:
- Wrong algorithm choice for the problem
- Subtle logic bugs (wrong return value, incorrect condition, wrong update)
- Missing edge case handling (empty input, single element, negative numbers, overflow)
- Incorrect recursion logic or missing memoization
- Wrong data structure usage
- Off-by-one errors the static rules missed
- Semantic mistakes (sorting but not using sorted result, modifying input incorrectly)
- Any other bug that would cause wrong answers or runtime errors

Return ONLY a JSON array. No explanation outside JSON. No markdown. No backticks.

Each element must have EXACTLY these fields:
{
  "type": "SHORT_TYPE_NAME",
  "severity": "error" or "warning" or "info",
  "message": "One sentence describing the bug",
  "explanation": "2-3 sentences explaining why this is a problem",
  "suggestion": "One sentence on how to fix it",
  "exampleFix": "A short code snippet showing the fix",
  "concept": "CS concept name (e.g. Two Pointers, Binary Search)",
  "topic": "Broader topic name",
  "learningHint": "One educational sentence about the concept",
  "isAI": true
}

If you find no new errors, return an empty array: []`;

    const userPrompt = `Analyze this ${language} code:\n\n${code}`;

    // ==========================================
    // Call Groq API
    // ==========================================

    try {

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOGICLENS_GROQ_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          max_tokens: 1024,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("LogicLens AI: Groq API error", response.status, errText);
        if (window.LogicLensChatPanel) window.LogicLensChatPanel.hideAIThinking();
        return;
      }

      const data = await response.json();
      const raw  = data?.choices?.[0]?.message?.content || "[]";

      // ==========================================
      // Parse JSON safely
      // ==========================================

      let aiDetections = [];

      try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        aiDetections = JSON.parse(cleaned);
        if (!Array.isArray(aiDetections)) aiDetections = [];
      } catch (parseErr) {
        console.error("LogicLens AI: Failed to parse JSON", parseErr, raw);
        aiDetections = [];
      }

      // ==========================================
      // Tag all AI results
      // ==========================================

      aiDetections = aiDetections.map(d => ({ ...d, isAI: true }));

      console.log(
        "%cLOGICLENS AI DETECTIONS:",
        "color:#a855f7;font-weight:bold;",
        aiDetections
      );

      // ==========================================
      // Merge with static results and re-render
      // ==========================================

      if (window.LogicLensChatPanel) {
        window.LogicLensChatPanel.hideAIThinking();
        const combined = [...staticDetections, ...aiDetections];
        window.LogicLensChatPanel.displayResults(combined);
      }

    } catch (networkErr) {
      console.error("LogicLens AI: Network error", networkErr);
      if (window.LogicLensChatPanel) window.LogicLensChatPanel.hideAIThinking();
    }

  }

};