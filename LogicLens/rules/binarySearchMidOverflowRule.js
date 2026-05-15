function detectBinarySearchMidOverflow(ast) {

  const detections = [];

  const boundaryNames = [
    "low",
    "high",
    "left",
    "right",
    "lo",
    "hi",
    "start",
    "end"
  ];

  function isBoundaryName(name) {

    return boundaryNames.includes(name);

  }

  traverseAst(ast, (node) => {

    // =====================================
    // SUPPORT:
    // mid = ...
    // let mid = ...
    // const mid = ...
    // =====================================

    if (
      node.type !== "AssignmentExpression" &&
      node.type !== "VariableDeclarator"
    ) {
      return;
    }

    let leftSide = null;
    let right = null;

    // =====================================
    // AssignmentExpression
    // mid = ...
    // =====================================

    if (
      node.type === "AssignmentExpression"
    ) {

      leftSide =
        generateReadableCode(node.left);

      right =
        node.right;

    }

    // =====================================
    // VariableDeclarator
    // let mid = ...
    // =====================================

    if (
      node.type === "VariableDeclarator"
    ) {

      leftSide =
        generateReadableCode(node.id);

      right =
        node.init;

    }

    if (leftSide !== "mid") {
      return;
    }

    // =====================================
    // Detect:
    // (low + high) / 2
    // Math.floor((low + high) / 2)
    // =====================================

    let divisionExpression = null;

    // =====================================
    // Pattern 1:
    // (low + high) / 2
    // =====================================

    if (
      right &&
      right.type === "BinaryExpression" &&
      right.operator === "/"
    ) {

      divisionExpression = right;

    }

    // =====================================
    // Pattern 2:
    // Math.floor((low + high) / 2)
    // =====================================

    if (
      right &&
      right.type === "CallExpression" &&
      right.callee &&
      right.callee.type === "MemberExpression"
    ) {

      const objectName =
        generateReadableCode(
          right.callee.object
        );

      const propertyName =
        generateReadableCode(
          right.callee.property
        );

      if (
        objectName === "Math" &&
        propertyName === "floor"
      ) {

        const firstArgument =
          right.arguments?.[0];

        if (
          firstArgument &&
          firstArgument.type ===
            "BinaryExpression" &&
          firstArgument.operator === "/"
        ) {

          divisionExpression =
            firstArgument;

        }

      }

    }

    if (!divisionExpression) {
      return;
    }

    // =====================================
    // Ensure division by 2
    // =====================================

    if (
      !divisionExpression.right ||
      divisionExpression.right.type !==
        "NumericLiteral" ||
      divisionExpression.right.value !== 2
    ) {
      return;
    }

    // =====================================
    // Detect:
    // low + high
    // =====================================

    const addExpression =
      divisionExpression.left;

    if (
      !addExpression ||
      addExpression.type !==
        "BinaryExpression" ||
      addExpression.operator !== "+"
    ) {
      return;
    }

    // =====================================
    // Ensure identifiers
    // =====================================

    if (
      addExpression.left.type !==
        "Identifier" ||
      addExpression.right.type !==
        "Identifier"
    ) {
      return;
    }

    const leftBoundary =
      addExpression.left.name;

    const rightBoundary =
      addExpression.right.name;

    // =====================================
    // Validate boundary names
    // =====================================

    if (
      !isBoundaryName(leftBoundary) ||
      !isBoundaryName(rightBoundary)
    ) {
      return;
    }

    // =====================================
    // Avoid duplicate detections
    // =====================================

    const alreadyExists =
      detections.some(
        (detection) =>

          detection.metadata
            ?.leftBoundary ===
            leftBoundary &&

          detection.metadata
            ?.rightBoundary ===
            rightBoundary
      );

    if (alreadyExists) {
      return;
    }

    // =====================================
    // PUSH DETECTION
    // =====================================

    detections.push({

      type:
        "BINARY_SEARCH_MID_OVERFLOW",

      severity: "warning",

      message:
        `Potential binary search midpoint overflow detected using "${leftBoundary} + ${rightBoundary}".`,

      explanation:
        "Adding large boundary values directly may overflow in Java/C++ binary search implementations.",

      suggestion:
        `Use "${leftBoundary} + (${rightBoundary} - ${leftBoundary}) / 2" instead.`,

      exampleFix:
        `mid = ${leftBoundary} + (${rightBoundary} - ${leftBoundary}) / 2;`,

      // =====================================
      // EDUCATIONAL MAPPING LAYER
      // =====================================

      concept:
        "Overflow-Safe Binary Search",

      topic:
        "Binary Search Midpoint Optimization",

      learningHint:
        "Using low + (high - low) / 2 prevents integer overflow and is considered the standard professional binary search pattern.",

      metadata: {
        leftBoundary,
        rightBoundary
      }

    });

  });

  return detections;
}