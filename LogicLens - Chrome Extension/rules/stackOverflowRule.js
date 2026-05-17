function detectStackOverflowRisk(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    /*
    ==========================================
    Detect function declarations
    ==========================================
    */

    if (
      node.type !== "FunctionDeclaration"
    ) {
      return;
    }

    const functionName =
      node.id?.name;

    if (!functionName) {
      return;
    }

    let recursiveCalls = 0;
    let hasBaseCondition = false;

    /*
    ==========================================
    Traverse function body
    ==========================================
    */

    traverseAst(node.body, (childNode) => {

      /*
      ==========================================
      Detect recursive calls
      Example:
      dfs()
      factorial()
      ==========================================
      */

      if (
        childNode.type === "CallExpression" &&
        childNode.callee &&
        childNode.callee.name === functionName
      ) {

        recursiveCalls++;

      }

      /*
      ==========================================
      Detect possible base condition
      Example:
      if(n === 0)
      return
      ==========================================
      */

      if (
        childNode.type === "IfStatement"
      ) {

        hasBaseCondition = true;

      }

    });

    /*
    ==========================================
    Detect recursion risk
    ==========================================
    */

    if (
      recursiveCalls > 0 &&
      !hasBaseCondition
    ) {

      detections.push({

        type: "STACK_OVERFLOW_RISK",

        severity: "warning",

        message:
          `Possible stack overflow risk detected in recursive function "${functionName}".`,

        explanation:
          `The function recursively calls itself but does not appear to contain a clear base condition, which may cause infinite recursion and stack overflow.`,

        suggestion:
          `Add a terminating base condition before recursive calls.`,

        exampleFix:
          `if (baseCondition) {\n  return;\n}`,

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Recursive Termination Logic",

        topic:
          "Recursion and Call Stack Management",

        learningHint:
          "Recursive functions must eventually stop calling themselves, otherwise the call stack keeps growing until stack overflow occurs.",

        metadata: {
          functionName,
          recursiveCalls
        }

      });

    }

  });

  return detections;
}