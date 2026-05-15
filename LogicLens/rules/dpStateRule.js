function detectDPStateOverwrite(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    /*
    ==========================================
    Detect loops
    ==========================================
    */

    if (
      node.type !== "ForStatement"
    ) {
      return;
    }

    /*
    ==========================================
    Extract loop update
    Example:
    i++
    i--
    ==========================================
    */

    let direction = null;
    let loopVariable = null;

    if (
      node.update &&
      node.update.type ===
        "UpdateExpression"
    ) {

      loopVariable =
        node.update.argument?.name;

      if (
        node.update.operator === "++"
      ) {
        direction = "forward";
      }

      if (
        node.update.operator === "--"
      ) {
        direction = "backward";
      }

    }

    if (!direction || !loopVariable) {
      return;
    }

    let suspiciousDPUpdate = false;

    /*
    ==========================================
    Traverse loop body
    ==========================================
    */

    traverseAst(node.body, (childNode) => {

      /*
      ==========================================
      Detect:
      dp[i] = ...
      ==========================================
      */

      if (
        childNode.type !==
        "AssignmentExpression"
      ) {
        return;
      }

      const leftSide =
        childNode.left;

      if (
        !leftSide ||
        leftSide.type !==
          "MemberExpression"
      ) {
        return;
      }

      /*
      ==========================================
      Detect computed access:
      dp[i]
      ==========================================
      */

      if (!leftSide.computed) {
        return;
      }

      const indexExpression =
        generateReadableCode(
          leftSide.property
        );

      /*
      ==========================================
      Detect:
      dp[i]
      dp[i+1]
      dp[i-1]
      ==========================================
      */

      if (
        indexExpression.includes(
          loopVariable
        )
      ) {

        const rightSide =
          generateReadableCode(
            childNode.right
          );

        /*
        ==========================================
        Detect dependency on nearby states
        ==========================================
        */

        if (
          rightSide.includes(
            `${loopVariable}-1`
          ) ||
          rightSide.includes(
            `${loopVariable}+1`
          )
        ) {

          suspiciousDPUpdate = true;

        }

      }

    });

    /*
    ==========================================
    Possible overwrite risk
    ==========================================
    */

    if (suspiciousDPUpdate) {

      detections.push({

        type:
          "DP_STATE_OVERWRITE",

        severity: "warning",

        message:
          `Possible DP state overwrite detected during ${direction} iteration.`,

        explanation:
          `Updating DP states in the wrong iteration order may overwrite values still needed for future computations.`,

        suggestion:
          `Verify whether the DP transition requires forward or backward iteration.`,

        exampleFix:
          `Consider reversing loop direction if previous states are being overwritten.`,

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Dynamic Programming State Transitions",

        topic:
          "Dynamic Programming",

        learningHint:
          "Some DP optimizations require careful iteration order to avoid overwriting states still needed later.",

        metadata: {
          direction,
          loopVariable
        }

      });

    }

  });

  return detections;
}