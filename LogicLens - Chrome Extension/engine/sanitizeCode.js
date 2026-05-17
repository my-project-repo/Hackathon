function sanitizeCode(code) {

  if (!code) {
    return "";
  }

  // ==========================================
  // Remove Monaco/Ace UI arrows & symbols
  // ==========================================
  code = code.replace(/[›⌄▸]/g, "");

  // ==========================================
  // Strip leading line numbers injected by
  // Ace / GFG / HackerRank DOM extraction.
  // Patterns seen:
  //   "1\n2\n3\n..." standalone number lines
  //   "  1 function foo" — number prefix on code line
  //   "28\nfunction search" etc.
  // Strategy: if line starts with digits-only (optional spaces)
  // followed by either end-of-line OR a tab/2+spaces then code,
  // strip the number prefix.
  // ==========================================

  // Case 1: entire line is just a number (Ace gutter lines injected separately)
  code = code.replace(/^\s*\d+\s*$/gm, "");

  // Case 2: line starts with a number then whitespace then code content
  // e.g. "  28 function search" or "1\tfunction"
  // Only strip if the number is at the very start of the line (with optional leading spaces)
  code = code.replace(/^[ \t]*\d+[ \t]+/gm, "");

  // ==========================================
  // Remove accidental standalone */
  // ==========================================
  code = code.replace(/^\s*\*\/\s*$/gm, "");

  // ==========================================
  // Collapse 3+ consecutive blank lines to 1
  // ==========================================
  code = code.replace(/\n{3,}/g, "\n\n");

  // ==========================================
  // Normalize non-breaking spaces
  // ==========================================
  code = code.replace(/\u00A0/g, " ");

  // ==========================================
  // Remove zero-width characters injected by
  // some editors (GFG, HackerRank)
  // ==========================================
  code = code.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");

  return code.trim();
}