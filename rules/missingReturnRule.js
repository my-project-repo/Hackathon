function detectMissingReturn(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    const functionTypes = [

      "FunctionDeclaration",
      "FunctionExpression",
      "ArrowFunctionExpression"

    ];

    if (
      !functionTypes.includes(
        node.type
      )
    ) {
      return;
    }

    // ===================================
    // Determine function name
    // ===================================

    let functionName =
      "anonymous";

    if (
      node.id &&
      node.id.name
    ) {

      functionName =
        node.id.name;

    } else if (
      node.parent &&
      node.parent.type ===
      "VariableDeclarator"
    ) {

      functionName =
        node.parent.id.name;
    }

    // ===================================
    // Ignore obvious side-effect functions
    // ===================================

    if (
      looksLikeVoidFunction(
        functionName
      )
    ) {

      return;
    }

    // ===================================
    // Detect return statement
    // ===================================

    let hasReturn = false;

    traverseAst(node.body, (child) => {

      if (
        child.type ===
        "ReturnStatement"
      ) {

        hasReturn = true;
      }

    });

    if (hasReturn) {
      return;
    }

    // ===================================
    // Ignore tiny anonymous callbacks
    // ===================================

    const bodyStatements =

      node.body &&
      node.body.body

        ? node.body.body.length

        : 0;

    if (
      functionName ===
        "anonymous" &&
      bodyStatements <= 1
    ) {

      return;
    }

    // ===================================
    // Detection
    // ===================================

    detections.push({

      type:
        "MISSING_RETURN",

      severity: "warning",

      message:
        `Function "${functionName}" may be missing a return statement.`,

      explanation:
        "This function does not appear to return a value.",

      suggestion:
        "Add a return statement if the function is expected to produce output.",

      // =====================================
      // EDUCATIONAL MAPPING LAYER
      // =====================================

      concept:
        "Function Output Semantics",

      topic:
        "Function Design and Return Values",

      learningHint:
        "Functions that compute values usually need explicit return statements so results can be used elsewhere in the program.",

      metadata: {
        functionName
      }
    });

  });

  return detections;
}

// =====================================
// HELPERS
// =====================================

function looksLikeVoidFunction(name) {

  const voidPatterns = [

    "print",
    "log",
    "show",
    "display",
    "render",
    "update",
    "handle",
    "click",
    "submit"

  ];

  return voidPatterns.some(
    (pattern) =>

      name
        .toLowerCase()
        .includes(pattern)
  );
}