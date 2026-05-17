function detectOffByOne(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    if (node.type !== "ForStatement") {
      return;
    }

    const test = node.test;

    if (
      !test ||
      test.type !== "BinaryExpression"
    ) {
      return;
    }

    if (test.operator !== "<=") {
      return;
    }

    // Left side example:
    // i

    const leftSide =
      generateReadableCode(test.left);

    // Right side example:
    // arr.length
    // 5
    // n

    const rightSide =
      generateReadableCode(test.right);

    detections.push({

      type: "OFF_BY_ONE",

      severity: "warning",

      message:
        `Loop condition uses "${leftSide} <= ${rightSide}".`,

      explanation:
        `The loop includes the upper bound "${rightSide}", which may cause one extra iteration.`,

      suggestion:
        `Consider using "${leftSide} < ${rightSide}" instead.`,

      // =====================================
      // EDUCATIONAL MAPPING LAYER
      // =====================================

      concept:
        "Boundary Condition Handling",

      topic:
        "Array Traversal and Loop Logic",

      learningHint:
        "Arrays are zero-indexed, so using <= length often accesses one invalid extra position.",

      metadata: {
        operator: test.operator,
        left: leftSide,
        right: rightSide
      }
    });

  });

  return detections;
}