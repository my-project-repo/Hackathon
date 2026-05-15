function detectInfiniteLoop(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    const isWhileLoop =
      node.type === "WhileStatement";

    const isForLoop =
      node.type === "ForStatement";

    if (!isWhileLoop && !isForLoop) {
      return;
    }

    // -----------------------------------
    // Extract loop condition
    // -----------------------------------

    const condition =
      node.test;

    // -----------------------------------
    // Infinite while(true)
    // -----------------------------------

    if (
      condition &&
      condition.type === "BooleanLiteral" &&
      condition.value === true
    ) {

      const hasBreak =
        containsBreakStatement(
          node.body
        );

      if (!hasBreak) {

        detections.push({

          type: "INFINITE_LOOP",

          severity: "error",

          message:
            "Potential infinite loop detected.",

          explanation:
            "This loop condition always evaluates to true and no break statement was found.",

          suggestion:
            "Add a terminating condition or break statement.",

          // =====================================
          // EDUCATIONAL MAPPING LAYER
          // =====================================

          concept:
            "Loop Termination Logic",

          topic:
            "Control Flow and Iteration",

          learningHint:
            "Every loop should eventually move toward a stopping condition, otherwise execution may continue forever.",

          metadata: {
            loopType:
              node.type
          }
        });
      }

      return;
    }

    // -----------------------------------
    // Detect missing state updates
    // -----------------------------------

    const updatedVariables = [

      ...findUpdatedVariables(
        node.body
      ),

      ...(node.update
        ? findUpdatedVariables(
            node.update
          )
        : [])

    ];

    const conditionVariables =
      extractConditionVariables(
        condition
      );

    const hasStateUpdate =
      conditionVariables.some(
        (variable) =>

          updatedVariables.includes(
            variable
          )
      );

    const hasBreak =
      containsBreakStatement(
        node.body
      );

    if (
      !hasStateUpdate &&
      !hasBreak &&
      conditionVariables.length > 0
    ) {

      detections.push({

        type:
          "POSSIBLE_INFINITE_LOOP",

        severity: "warning",

        message:
          `Loop condition variables (${conditionVariables.join(", ")}) are never updated.`,

        explanation:
          "The loop condition may never become false.",

        suggestion:
          "Update loop control variables or add a terminating condition.",

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Loop State Management",

        topic:
          "Iteration and Termination Conditions",

        learningHint:
          "Loop variables usually need to change over time so the loop condition can eventually become false.",

        metadata: {
          variables:
            conditionVariables
        }
      });
    }

  });

  return detections;
}

// =====================================
// HELPERS
// =====================================

function containsBreakStatement(node) {

  let found = false;

  traverseAst(node, (child) => {

    if (
      child.type === "BreakStatement"
    ) {

      found = true;
    }

  });

  return found;
}

function findUpdatedVariables(node) {

  const updated = [];

  traverseAst(node, (child) => {

    // i++
    // i--

    if (
      child.type === "UpdateExpression" &&
      child.argument &&
      child.argument.type === "Identifier"
    ) {

      updated.push(
        child.argument.name
      );
    }

    // i = ...
    // i += ...

    if (
      child.type === "AssignmentExpression" &&
      child.left &&
      child.left.type === "Identifier"
    ) {

      updated.push(
        child.left.name
      );
    }

  });

  return updated;
}

function extractConditionVariables(node) {

  const variables = [];

  traverseAst(node, (child) => {

    if (
      child.type === "Identifier"
    ) {

      variables.push(
        child.name
      );
    }

  });

  return [...new Set(variables)];
}