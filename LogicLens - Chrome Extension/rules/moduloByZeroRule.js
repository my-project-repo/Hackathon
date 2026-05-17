function detectModuloByZeroRisk(ast) {

  const detections = [];

  function hasZeroProtection(node, variableName) {

    let current = node.parent;

    while (current) {

      // =====================================
      // Detect:
      // if(y !== 0)
      // if(y != 0)
      // if(0 !== y)
      // =====================================

      if (
        current.type === "IfStatement"
      ) {

        const test =
          current.test;

        if (
          test &&
          test.type ===
            "BinaryExpression"
        ) {

          const operators = [
            "!=",
            "!=="
          ];

          if (
            operators.includes(
              test.operator
            )
          ) {

            const left =
              generateReadableCode(
                test.left
              );

            const right =
              generateReadableCode(
                test.right
              );

            if (
              (left === variableName &&
                right === "0") ||

              (left === "0" &&
                right === variableName)
            ) {

              return true;

            }

          }

        }

      }

      current = current.parent;

    }

    return false;

  }

  traverseAst(ast, (node) => {

    // =====================================
    // Detect:
    // x / y
    // x % y
    // =====================================

    if (
      node.type !== "BinaryExpression"
    ) {
      return;
    }

    const riskyOperators = [
      "/",
      "%"
    ];

    if (
      !riskyOperators.includes(
        node.operator
      )
    ) {
      return;
    }

    const denominator =
      node.right;

    if (!denominator) {
      return;
    }

    const denominatorText =
      generateReadableCode(
        denominator
      );

    // =====================================
    // SAFE:
    // x / 5
    // =====================================

    if (
      denominator.type ===
        "NumericLiteral" &&
      denominator.value !== 0
    ) {
      return;
    }

    // =====================================
    // DIRECT ZERO:
    // x / 0
    // =====================================

    if (
      denominator.type ===
        "NumericLiteral" &&
      denominator.value === 0
    ) {

      detections.push({

        type:
          "DIVISION_BY_ZERO",

        severity: "error",

        message:
          `Division or modulo by literal zero detected.`,

        explanation:
          "Division or modulo by zero causes runtime crashes or undefined behavior.",

        suggestion:
          "Ensure the denominator is never zero.",

        exampleFix:
          `if (value !== 0) {\n  result = x ${node.operator} value;\n}`,

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Arithmetic Runtime Safety",

        topic:
          "Division and Modulo Validation",

        learningHint:
          "Division and modulo operations require non-zero denominators to avoid runtime exceptions.",

        metadata: {
          operator:
            node.operator
        }

      });

      return;

    }

    // =====================================
    // Variable denominator
    // =====================================

    if (
      denominator.type !==
        "Identifier"
    ) {
      return;
    }

    const variableName =
      denominator.name;

    // =====================================
    // Skip protected cases
    // =====================================

    const protectedDivision =
      hasZeroProtection(
        node,
        variableName
      );

    if (protectedDivision) {
      return;
    }

    // =====================================
    // Avoid duplicates
    // =====================================

    const alreadyExists =
      detections.some(
        (detection) =>

          detection.metadata
            ?.variable ===
            variableName
      );

    if (alreadyExists) {
      return;
    }

    // =====================================
    // PUSH DETECTION
    // =====================================

    detections.push({

      type:
        "MODULO_BY_ZERO_RISK",

      severity: "warning",

      message:
        `Possible division/modulo by zero risk using "${variableName}".`,

      explanation:
        `The denominator "${variableName}" may become zero during execution.`, 

      suggestion:
        `Validate "${variableName}" before division or modulo operations.`,

      exampleFix:
        `if (${variableName} !== 0) {\n  result = x ${node.operator} ${variableName};\n}`,

      // =====================================
      // EDUCATIONAL MAPPING LAYER
      // =====================================

      concept:
        "Runtime Arithmetic Validation",

      topic:
        "Safe Division Operations",

      learningHint:
        "Always validate dynamic denominators before division or modulo operations to avoid runtime crashes.",

      metadata: {
        variable:
          variableName,

        operator:
          node.operator
      }

    });

  });

  return detections;
}