function detectAssignmentInCondition(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    const conditionalNodes = [

      "IfStatement",
      "WhileStatement",
      "DoWhileStatement",
      "ForStatement"

    ];

    if (
      !conditionalNodes.includes(node.type)
    ) {
      return;
    }

    // -----------------------------------
    // Extract condition
    // -----------------------------------

    const condition =
      node.test;

    if (!condition) {
      return;
    }

    // -----------------------------------
    // Detect assignment inside condition
    // -----------------------------------

    traverseAst(condition, (child) => {

      if (
        child.type !== "AssignmentExpression"
      ) {
        return;
      }

      const leftSide =
        generateReadableCode(
          child.left
        );

      const rightSide =
        generateReadableCode(
          child.right
        );

      detections.push({

        type:
          "ASSIGNMENT_IN_CONDITION",

        severity: "warning",

        message:
          `Assignment "${leftSide} = ${rightSide}" found inside condition.`,

        explanation:
          "Assignments inside conditions are often accidental and may cause unexpected logic behavior.",

        suggestion:
          `Did you mean "${leftSide} == ${rightSide}" or "${leftSide} === ${rightSide}" instead?`,

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Conditional Logic Validation",

        topic:
          "Comparison vs Assignment Operators",

        learningHint:
          "Assignment (=) changes values, while comparison operators (== or ===) check equality.",

        metadata: {
          left: leftSide,
          right: rightSide,
          operator: "="
        }
      });

    });

  });

  return detections;
}