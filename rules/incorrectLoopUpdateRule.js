function detectIncorrectLoopUpdate(ast) {

  const detections = [];

  function getLoopVariable(init) {

    if (!init) {
      return null;
    }

    // =====================================
    // let i = 0
    // =====================================

    if (
      init.type ===
        "VariableDeclaration"
    ) {

      const declaration =
        init.declarations?.[0];

      if (
        declaration &&
        declaration.id &&
        declaration.id.type ===
          "Identifier"
      ) {

        return declaration.id.name;

      }

    }

    // =====================================
    // i = 0
    // =====================================

    if (
      init.type ===
        "AssignmentExpression"
    ) {

      if (
        init.left &&
        init.left.type ===
          "Identifier"
      ) {

        return init.left.name;

      }

    }

    return null;

  }

  function getConditionVariable(test) {

    if (!test) {
      return null;
    }

    // =====================================
    // i < n
    // =====================================

    if (
      test.type ===
        "BinaryExpression"
    ) {

      if (
        test.left &&
        test.left.type ===
          "Identifier"
      ) {

        return test.left.name;

      }

    }

    return null;

  }

  function getUpdatedVariable(update) {

    if (!update) {
      return null;
    }

    // =====================================
    // i++
    // j++
    // =====================================

    if (
      update.type ===
        "UpdateExpression"
    ) {

      if (
        update.argument &&
        update.argument.type ===
          "Identifier"
      ) {

        return update.argument.name;

      }

    }

    // =====================================
    // i += 1
    // =====================================

    if (
      update.type ===
        "AssignmentExpression"
    ) {

      if (
        update.left &&
        update.left.type ===
          "Identifier"
      ) {

        return update.left.name;

      }

    }

    return null;

  }

  traverseAst(ast, (node) => {

    // =====================================
    // Detect for loops
    // =====================================

    if (
      node.type !==
        "ForStatement"
    ) {
      return;
    }

    const loopVariable =
      getLoopVariable(
        node.init
      );

    const conditionVariable =
      getConditionVariable(
        node.test
      );

    const updatedVariable =
      getUpdatedVariable(
        node.update
      );

    if (
      !loopVariable ||
      !conditionVariable
    ) {
      return;
    }

    // =====================================
    // Missing update entirely
    // =====================================

    if (!node.update) {

      detections.push({

        type:
          "INCORRECT_LOOP_VARIABLE_UPDATE",

        severity: "error",

        message:
          `Loop variable "${loopVariable}" is never updated.`,

        explanation:
          `The loop condition depends on "${conditionVariable}", but no update expression exists.`,

        suggestion:
          `Update "${loopVariable}" inside the loop update section.`,

        exampleFix:
          `for(let ${loopVariable}=0; ${loopVariable}<n; ${loopVariable}++)`,

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Loop Control Flow",

        topic:
          "Loop Variable Management",

        learningHint:
          "Loop conditions require corresponding variable updates to ensure termination and avoid infinite loops.",

        metadata: {
          loopVariable
        }

      });

      return;

    }

    // =====================================
    // Wrong variable updated
    // Example:
    // for(let i=0;i<n;j++)
    // =====================================

    if (
      updatedVariable &&
      updatedVariable !==
        loopVariable
    ) {

      detections.push({

        type:
          "INCORRECT_LOOP_VARIABLE_UPDATE",

        severity: "error",

        message:
          `Loop updates "${updatedVariable}" instead of "${loopVariable}".`,

        explanation:
          `The loop condition depends on "${loopVariable}", but a different variable is updated.`,

        suggestion:
          `Update "${loopVariable}" instead of "${updatedVariable}".`,

        exampleFix:
          `for(let ${loopVariable}=0; ${loopVariable}<n; ${loopVariable}++)`,

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Loop State Consistency",

        topic:
          "Correct Loop Variable Updates",

        learningHint:
          "The variable controlling loop termination should be the same variable updated each iteration.",

        metadata: {
          loopVariable,
          updatedVariable
        }

      });

    }

  });

  return detections;

}