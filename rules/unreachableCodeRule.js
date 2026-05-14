function detectUnreachableCode(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    // -----------------------------------
    // Only inspect block statements
    // -----------------------------------

    if (
      node.type !== "BlockStatement"
    ) {
      return;
    }

    const body =
      node.body || [];

    let unreachableStarted = false;

    for (
      let i = 0;
      i < body.length;
      i++
    ) {

      const statement =
        body[i];

      // -----------------------------------
      // Detect unreachable statement
      // -----------------------------------

      if (unreachableStarted) {

        const statementType =
          statement.type;

        detections.push({

          type:
            "UNREACHABLE_CODE",

          severity: "warning",

          message:
            `Unreachable ${statementType} detected.`,

          explanation:
            "This statement appears after a terminating statement and may never execute.",

          suggestion:
            "Remove unreachable code or restructure control flow.",

          // =====================================
          // EDUCATIONAL MAPPING LAYER
          // =====================================

          concept:
            "Control Flow Analysis",

          topic:
            "Program Execution Flow",

          learningHint:
            "Statements placed after return, break, continue, or throw usually never execute because program control already exited the block.",

          metadata: {
            statementType
          }
        });

        continue;
      }

      // -----------------------------------
      // Detect terminating statements
      // -----------------------------------

      const terminatingStatements = [

        "ReturnStatement",
        "BreakStatement",
        "ContinueStatement",
        "ThrowStatement"

      ];

      if (
        terminatingStatements.includes(
          statement.type
        )
      ) {

        unreachableStarted = true;
      }
    }

  });

  return detections;
}