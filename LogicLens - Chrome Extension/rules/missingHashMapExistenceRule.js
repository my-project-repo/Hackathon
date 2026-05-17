function detectMissingHashMapExistenceCheck(ast) {

  const detections = [];

  function getComputedAccessSignature(node) {

    if (
      !node ||
      node.type !== "MemberExpression" ||
      !node.computed
    ) {
      return null;
    }

    const object =
      generateReadableCode(
        node.object
      );

    const property =
      generateReadableCode(
        node.property
      );

    return `${object}[${property}]`;

  }

  function findSafeInitializations() {

    const safe = new Set();

    traverseAst(ast, (node) => {

      // =====================================
      // map[key] = []
      // map[key] = {}
      // map[key] = map[key] || []
      // =====================================

      if (
        node.type ===
          "AssignmentExpression"
      ) {

        const leftSig =
          getComputedAccessSignature(
            node.left
          );

        if (!leftSig) {
          return;
        }

        safe.add(leftSig);

        if (
          node.operator === "=" &&
          node.right &&
          node.right.type ===
            "LogicalExpression"
        ) {

          safe.add(leftSig);

        }

      }

      // =====================================
      // map[key] ??= []
      // =====================================

      if (
        node.type ===
          "AssignmentExpression" &&
        node.operator === "??="
      ) {

        const leftSig =
          getComputedAccessSignature(
            node.left
          );

        if (leftSig) {

          safe.add(leftSig);

        }

      }

      // =====================================
      // if (!map[key])
      // =====================================

      if (
        node.type === "IfStatement" &&
        node.test &&
        node.test.type ===
          "UnaryExpression" &&
        node.test.operator === "!"
      ) {

        const sig =
          getComputedAccessSignature(
            node.test.argument
          );

        if (sig) {

          safe.add(sig);

        }

      }

      // =====================================
      // if(map[key] === undefined)
      // =====================================

      if (
        node.type === "IfStatement" &&
        node.test &&
        node.test.type ===
          "BinaryExpression"
      ) {

        const left =
          generateReadableCode(
            node.test.left
          );

        const right =
          generateReadableCode(
            node.test.right
          );

        if (
          right === "undefined"
        ) {

          safe.add(left);

        }

      }

    });

    return safe;

  }

  const safeInitializations =
    findSafeInitializations();

  traverseAst(ast, (node) => {

    // =====================================
    // Detect:
    // map[key].push(x)
    // =====================================

    if (
      node.type !==
        "CallExpression"
    ) {
      return;
    }

    if (
      !node.callee ||
      node.callee.type !==
        "MemberExpression"
    ) {
      return;
    }

    const methodName =
      generateReadableCode(
        node.callee.property
      );

    const riskyMethods = [
      "push",
      "add",
      "insert"
    ];

    if (
      !riskyMethods.includes(
        methodName
      )
    ) {
      return;
    }

    const target =
      node.callee.object;

    if (
      !target ||
      target.type !==
        "MemberExpression" ||
      !target.computed
    ) {
      return;
    }

    const signature =
      getComputedAccessSignature(
        target
      );

    if (!signature) {
      return;
    }

    // =====================================
    // SAFE CASE
    // =====================================

    if (
      safeInitializations.has(
        signature
      )
    ) {
      return;
    }

    // =====================================
    // Avoid duplicates
    // =====================================

    const alreadyExists =
      detections.some(
        (detection) =>

          detection.metadata
            ?.key ===
            signature
      );

    if (alreadyExists) {
      return;
    }

    // =====================================
    // PUSH DETECTION
    // =====================================

    detections.push({

      type:
        "MISSING_HASHMAP_EXISTENCE_CHECK",

      severity: "warning",

      message:
        `Possible access to uninitialized key "${signature}".`,

      explanation:
        "The key may not exist before accessing or mutating its value.",

      suggestion:
        `Initialize "${signature}" before use.`,

      exampleFix:
        `if (!${signature}) {\n  ${signature} = [];\n}`,

      // =====================================
      // EDUCATIONAL MAPPING LAYER
      // =====================================

      concept:
        "HashMap Key Safety",

      topic:
        "HashMap and Dictionary Initialization",

      learningHint:
        "Before mutating values stored at dynamic keys, ensure the key exists or initialize it safely.",

      metadata: {
        key: signature,
        method: methodName
      }

    });

  });

  return detections;

}