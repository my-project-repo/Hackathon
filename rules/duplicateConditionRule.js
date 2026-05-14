function detectDuplicateConditions(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    /*
    ==========================================
    Detect:
    if (...) else if (...)
    ==========================================
    */

    if (
      node.type !== "IfStatement"
    ) {
      return;
    }

    /*
    ==========================================
    Store previously seen conditions
    ==========================================
    */

    const seenConditions = new Set();

    let current = node;

    while (current) {

      /*
      ==========================================
      Extract readable condition
      ==========================================
      */

      const condition =
        generateReadableCode(
          current.test
        );

      /*
      ==========================================
      Detect duplicate condition
      ==========================================
      */

      if (
        seenConditions.has(condition)
      ) {

        detections.push({

          type:
            "DUPLICATE_CONDITIONS",

          severity: "warning",

          message:
            `Duplicate condition detected: "${condition}".`,

          explanation:
            `This condition duplicates a previous branch and may never execute as intended.`,

          suggestion:
            `Modify or remove the repeated condition to avoid unreachable logic.`,

          exampleFix:
            `Use a different condition in the else-if branch.`,

          // =====================================
          // EDUCATIONAL MAPPING LAYER
          // =====================================

          concept:
            "Conditional Branch Analysis",

          topic:
            "Control Flow and Logical Branching",

          learningHint:
            "Repeated conditions inside if-else chains can make later branches unreachable because earlier matching branches already capture the same logic.",

          metadata: {
            duplicatedCondition:
              condition
          }

        });

      }

      seenConditions.add(condition);

      /*
      ==========================================
      Move to else-if chain
      ==========================================
      */

      if (
        current.alternate &&
        current.alternate.type ===
          "IfStatement"
      ) {

        current = current.alternate;

      } else {

        current = null;

      }

    }

  });

  return detections;
}