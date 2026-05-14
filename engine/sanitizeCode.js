function sanitizeCode(code) {

  if (!code) {
    return "";
  }

  // Remove weird Monaco arrows
  code = code.replace(/[›⌄]/g, "");

  // Remove isolated line numbers
  code = code.replace(
    /^\s*\d+\s*$/gm,
    ""
  );

  // Remove accidental standalone */
  code = code.replace(
    /^\s*\*\/\s*$/gm,
    ""
  );

  // Normalize spaces
  code = code.replace(
    /\u00A0/g,
    " "
  );

  return code.trim();
}