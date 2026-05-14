function detectNullAccess(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    if (
      node.type !== "MemberExpression"
    ) {
      return;
    }

    // -----------------------------------
    // Ignore optional chaining
    // -----------------------------------

    if (node.optional === true) {
      return;
    }

    // -----------------------------------
    // Extract full chain
    // -----------------------------------

    const chain =
      extractMemberChain(node);

    // Only care about deep chains
    // Example:
    // head.next.next

    if (chain.length < 3) {
      return;
    }

    const readableChain =
      chain.join(".");

    // -----------------------------------
    // Check surrounding null guards
    // -----------------------------------

    const hasGuard =
      hasNullCheckProtection(node);

    if (hasGuard) {
      return;
    }

    detections.push({

      type: "NULL_ACCESS_RISK",

      severity: "warning",

      message:
        `Nested property access "${readableChain}" may cause null or undefined access.`,

      explanation:
        "One of the intermediate objects may be null or undefined before nested access occurs.",

      suggestion:
        "Add null checks or use optional chaining (?.).",

      metadata: {
        chain: readableChain
      }
    });

  });

  return detections;
}

// =====================================
// HELPERS
// =====================================

function extractMemberChain(node) {

  const parts = [];

  function walk(current) {

    if (!current) {
      return;
    }

    if (
      current.type === "Identifier"
    ) {

      parts.unshift(
        current.name
      );

      return;
    }

    if (
      current.type === "MemberExpression"
    ) {

      if (
        current.property &&
        current.property.type === "Identifier"
      ) {

        parts.unshift(
          current.property.name
        );
      }

      walk(current.object);
    }
  }

  walk(node);

  return parts;
}

function hasNullCheckProtection(node) {

  let current = node.parent;

  while (current) {

    // -----------------------------------
    // if(head && head.next)
    // -----------------------------------

    if (
      current.type === "IfStatement"
    ) {

      const conditionText =
        JSON.stringify(current.test);

      const chain =
        extractMemberChain(node);

      const root =
        chain[0];

      if (
        conditionText.includes(root)
      ) {

        return true;
      }
    }

    current = current.parent;
  }

  return false;
}