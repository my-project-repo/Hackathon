function detectMissingEdgeCaseHandling(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    /*
    ==========================================
    Detect:
    arr[0]
    ==========================================
    */

    if (
      node.type !== "MemberExpression"
    ) {
      return;
    }

    /*
    ==========================================
    Ensure computed access
    Example:
    arr[0]
    not:
    arr.length
    ==========================================
    */

    if (!node.computed) {
      return;
    }

    /*
    ==========================================
    Detect index access:
    [0]
    ==========================================
    */

    if (
      !node.property ||
      node.property.type !== "Literal" ||
      node.property.value !== 0
    ) {
      return;
    }

    const arrayName =
      generateReadableCode(node.object);

    /*
    ==========================================
    Ignore obvious safe patterns
    Example:
    if(arr.length > 0) arr[0]
    (basic heuristic not implemented yet)
    ==========================================
    */

    detections.push({

      type:
        "MISSING_EDGE_CASE_HANDLING",

      severity: "warning",

      message:
        `Possible missing empty-array check before accessing "${arrayName}[0]".`,

      explanation:
        `The array "${arrayName}" may be empty before accessing its first element, which can lead to undefined values or runtime issues.`,

      suggestion:
        `Check whether the array contains elements before accessing index 0.`,

      exampleFix:
        `if (${arrayName}.length > 0) {\n  ${arrayName}[0];\n}`,

      // =====================================
      // EDUCATIONAL MAPPING LAYER
      // =====================================

      concept:
        "Edge Case Handling",

      topic:
        "Array Bounds and Defensive Programming",

      learningHint:
        "Algorithms should safely handle edge cases like empty arrays before accessing elements by index.",

      metadata: {
        array: arrayName,
        index: 0
      }

    });

  });

  return detections;
}