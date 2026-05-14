function detectMissingBaseCase(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    const isFunction =

      node.type === "FunctionDeclaration" ||

      node.type === "FunctionExpression" ||

      node.type === "ArrowFunctionExpression";

    if (!isFunction) {
      return;
    }

    // -----------------------------------
    // Determine function name
    // -----------------------------------

    let functionName = null;

    if (
      node.id &&
      node.id.name
    ) {

      functionName = node.id.name;

    } else if (
      node.parent &&
      node.parent.type === "VariableDeclarator"
    ) {

      functionName =
        node.parent.id.name;
    }

    if (!functionName) {
      return;
    }

    // -----------------------------------
    // Detect recursive calls
    // -----------------------------------

    let hasRecursiveCall = false;

    traverseAst(node.body, (child) => {

      if (
        child.type === "CallExpression" &&
        child.callee &&
        child.callee.type === "Identifier" &&
        child.callee.name === functionName
      ) {

        hasRecursiveCall = true;
      }

    });

    if (!hasRecursiveCall) {
      return;
    }

    // -----------------------------------
    // Detect base condition
    // -----------------------------------

    let hasBaseCase = false;

    traverseAst(node.body, (child) => {

      // if(...)
      // return ...
      // break recursion condition

      if (
        child.type === "IfStatement"
      ) {

        hasBaseCase = true;
      }

    });

    // -----------------------------------
    // Detection
    // -----------------------------------

    if (!hasBaseCase) {

      detections.push({

        type: "MISSING_BASE_CASE",

        severity: "error",

        message:
          `Recursive function "${functionName}" may be missing a base case.`,

        explanation:
          "Recursive functions usually require a terminating condition to stop recursive calls.",

        suggestion:
          "Add a base condition such as if(n === 0) or another terminating case.",

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Recursive Termination",

        topic:
          "Recursion and DFS Logic",

        learningHint:
          "Every recursive algorithm needs a stopping condition, otherwise recursive calls continue indefinitely and may cause stack overflow.",

        metadata: {
          functionName
        }
      });
    }

  });

  return detections;
}