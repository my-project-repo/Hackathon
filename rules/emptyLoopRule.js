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

        metadata: {
          loopType
        }
      });
    }

  });

  return detections;
}