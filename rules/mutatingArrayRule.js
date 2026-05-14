function detectArrayMutationDuringIteration(ast) {

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
    // Extract arrays used in condition
    // -----------------------------------

    const iteratedArrays =
      extractIteratedArrays(
        node.test
      );

    if (
      iteratedArrays.length === 0
    ) {
      return;
    }

    // -----------------------------------
    // Detect mutations inside loop body
    // -----------------------------------

    traverseAst(node.body, (child) => {

      if (
        child.type !== "CallExpression"
      ) {
        return;
      }

      if (
        child.callee.type !==
        "MemberExpression"
      ) {
        return;
      }

      const object =
        generateReadableCode(
          child.callee.object
        );

      const method =
        generateReadableCode(
          child.callee.property
        );

      const dangerousMethods = [

        "pop",
        "push",
        "shift",
        "unshift",
        "splice"

      ];

      if (
        !dangerousMethods.includes(
          method
        )
      ) {
        return;
      }

      if (
        !iteratedArrays.includes(
          object
        )
      ) {
        return;
      }

      detections.push({

        type:
          "ARRAY_MUTATION_DURING_ITERATION",

        severity: "warning",

        message:
          `Array "${object}" is mutated using "${method}()" during iteration.`,

        explanation:
          "Changing array length while iterating may skip elements or produce unexpected behavior.",

        suggestion:
          "Avoid mutating array length during iteration or iterate over a copy instead.",

        // =====================================
        // EDUCATIONAL MAPPING LAYER
        // =====================================

        concept:
          "Safe Collection Traversal",

        topic:
          "Array Iteration and Mutation Semantics",

        learningHint:
          "Changing array size during iteration can shift indexes and cause skipped elements or inconsistent traversal behavior.",

        metadata: {
          array: object,
          method
        }
      });

    });

  });

  return detections;
}

// =====================================
// HELPERS
// =====================================

function extractIteratedArrays(condition) {

  const arrays = [];

  if (!condition) {
    return arrays;
  }

  traverseAst(condition, (child) => {

    // arr.length

    if (
      child.type === "MemberExpression"
    ) {

      const property =
        generateReadableCode(
          child.property
        );

      if (
        property === "length"
      ) {

        const object =
          generateReadableCode(
            child.object
          );

        arrays.push(object);
      }
    }

  });

  return [...new Set(arrays)];
}