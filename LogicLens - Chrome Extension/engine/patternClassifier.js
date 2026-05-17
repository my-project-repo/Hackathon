function classifyPatterns(ast) {

  const detectedPatterns = [];

  // =====================================
  // HELPERS
  // =====================================

  function addPattern(
    name,
    confidence,
    metadata = {}
  ) {

    const alreadyExists =
      detectedPatterns.some(
        (pattern) =>
          pattern.name === name
      );

    if (alreadyExists) {
      return;
    }

    detectedPatterns.push({

      name,

      confidence,

      metadata

    });

  }

 function getReadable(node) {

  if (!node) {
    return "";
  }

  try {

    return (
      generateReadableCode(node) || ""
    );

  } catch (error) {

    return "";

  }

}

  // =====================================
  // DETECT PATTERNS
  // =====================================

  traverseAst(ast, (node) => {

    // =====================================
    // BINARY SEARCH
    // =====================================

    if (
      node.type === "WhileStatement"
    ) {

      const condition =
        getReadable(node.test);

      let hasMid = false;
      let hasLowUpdate = false;
      let hasHighUpdate = false;

      traverseAst(node.body, (child) => {

        const readable =
          getReadable(child);

        if (
          readable.includes("mid")
        ) {

          hasMid = true;

        }

        if (
          readable.includes("low") ||
          readable.includes("left")
        ) {

          hasLowUpdate = true;

        }

        if (
          readable.includes("high") ||
          readable.includes("right")
        ) {

          hasHighUpdate = true;

        }

      });

      if (
        condition.includes("<=") &&
        hasMid &&
        hasLowUpdate &&
        hasHighUpdate
      ) {

        addPattern(
          "Binary Search",
          "high",
          {
            technique:
              "divide-and-conquer"
          }
        );

      }

    }

    // =====================================
    // SLIDING WINDOW
    // =====================================

    if (
      node.type === "ForStatement" ||
      node.type === "WhileStatement"
    ) {

      let leftUsed = false;
      let rightUsed = false;

      traverseAst(node.body, (child) => {

        const readable =
          getReadable(child);

        if (

          readable.includes("left") ||
          readable.includes("l++")

        ) {

          leftUsed = true;

        }

        if (

          readable.includes("right") ||
          readable.includes("r++")

        ) {

          rightUsed = true;

        }

      });

      if (
        leftUsed &&
        rightUsed
      ) {

        addPattern(
          "Sliding Window",
          "medium",
          {
            technique:
              "two-pointers"
          }
        );

      }

    }

    // =====================================
    // PREFIX SUM
    // =====================================

    if (
      node.type ===
        "AssignmentExpression"
    ) {

      const left =
        getReadable(node.left);

      const right =
        getReadable(node.right);

      if (

        right.includes(
          `${left} +`
        ) ||

        right.includes(
          `+ ${left}`
        )

      ) {

        addPattern(
          "Prefix Sum",
          "medium",
          {
            technique:
              "cumulative-sum"
          }
        );

      }

    }

    // =====================================
    // DFS / RECURSION
    // =====================================

    if (
      node.type ===
        "FunctionDeclaration"
    ) {

      const functionName =
        node.id?.name;

      if (!functionName) {
        return;
      }

      let recursiveCall =
        false;

      traverseAst(node.body, (child) => {

        if (

          child.type ===
            "CallExpression" &&

          child.callee &&
          child.callee.name ===
            functionName

        ) {

          recursiveCall =
            true;

        }

      });

      if (recursiveCall) {

        addPattern(
          "Depth First Search / Recursion",
          "high",
          {
            technique:
              "recursive-traversal"
          }
        );

      }

    }

    // =====================================
    // HASHMAP FREQUENCY COUNT
    // =====================================

    if (
      node.type ===
        "AssignmentExpression"
    ) {

      const left =
        getReadable(node.left);

      const right =
        getReadable(node.right);

      if (

        left.includes("[") &&
        right.includes("+ 1")

      ) {

        addPattern(
          "Frequency Counter",
          "high",
          {
            technique:
              "hashmap-counting"
          }
        );

      }

    }

    // =====================================
    // TWO POINTERS
    // =====================================

    if (
      node.type ===
        "WhileStatement"
    ) {

      const condition =
        getReadable(node.test);

      if (

        condition.includes("left") &&
        condition.includes("right")

      ) {

        addPattern(
          "Two Pointers",
          "medium",
          {
            technique:
              "pointer-convergence"
          }
        );

      }

    }

    // =====================================
    // DYNAMIC PROGRAMMING
    // =====================================

    if (
      node.type ===
        "AssignmentExpression"
    ) {

      const left =
        getReadable(node.left);

      const right =
        getReadable(node.right);

      if (

        left.includes("dp[") &&
        right.includes("dp[")

      ) {

        addPattern(
          "Dynamic Programming",
          "high",
          {
            technique:
              "state-transition"
          }
        );

      }

    }

    // =====================================
    // MONOTONIC STACK
    // =====================================

    if (
      node.type ===
        "CallExpression"
    ) {

      const readable =
        getReadable(node);

      if (

        readable.includes(".push") ||
        readable.includes(".pop")

      ) {

        addPattern(
          "Stack-Based Processing",
          "medium",
          {
            technique:
              "monotonic-stack"
          }
        );

      }

    }

  });

  return detectedPatterns;

}