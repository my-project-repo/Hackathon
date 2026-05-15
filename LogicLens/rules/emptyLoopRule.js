function detectEmptyLoopBody(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    const loopTypes = [

      "ForStatement",
      "WhileStatement",
      "DoWhileStatement"

    ];

    if (
      !loopTypes.includes(node.type)
    ) {
      return;
    }

    // -----------------------------------
    // Detect EmptyStatement body
    // -----------------------------------

    if (
      node.body &&
      node.body.type === "EmptyStatement"
    ) {

      const loopType =
        node.type
          .replace("Statement", "")
          .toLowerCase();

      detections.push({

        type:
          "EMPTY_LOOP_BODY",

        severity: "warning",

        message:
          `Empty ${loopType} loop body detected.`,

        explanation:
          "A stray semicolon causes the loop to execute with an empty body.",

        suggestion:
          "Remove the semicolon or add a proper loop block using { }.",

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Loop Structure Validation",

        topic:
          "Loop Syntax and Control Flow",

        learningHint:
          "A semicolon immediately after a loop creates an empty loop body, causing the intended logic block to execute outside the loop.",

        metadata: {
          loopType
        }
      });
    }

  });

  return detections;
}