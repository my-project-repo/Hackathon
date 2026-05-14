function detectSlidingWindowNotShrinking(ast) {

  const detections = [];

  traverseAst(ast, (node) => {

    /*
    ==========================================
    Detect loops
    ==========================================
    */

    if (
      node.type !== "ForStatement" &&
      node.type !== "WhileStatement"
    ) {
      return;
    }

    let expandsWindow = false;
    let shrinksWindow = false;

    /*
    ==========================================
    Traverse loop body
    ==========================================
    */

    traverseAst(node.body, (childNode) => {

      /*
      ==========================================
      Detect right pointer expansion
      Example:
      right++
      r++
      end++
      ==========================================
      */

      if (
        childNode.type ===
        "UpdateExpression"
      ) {

        const variableName =
          childNode.argument?.name;

        if (
          variableName === "right" ||
          variableName === "r" ||
          variableName === "end"
        ) {

          expandsWindow = true;

        }

        /*
        ==========================================
        Detect left pointer shrink
        Example:
        left++
        l++
        start++
        ==========================================
        */

        if (
          variableName === "left" ||
          variableName === "l" ||
          variableName === "start"
        ) {

          shrinksWindow = true;

        }

      }

    });

    /*
    ==========================================
    Detect possible issue
    ==========================================
    */

    if (
      expandsWindow &&
      !shrinksWindow
    ) {

      detections.push({

        type:
          "SLIDING_WINDOW_NOT_SHRINKING",

        severity: "warning",

        message:
          `Sliding window expands but never appears to shrink.`,

        explanation:
          `The sliding window grows continuously without updating the left boundary, which may violate window constraints or produce incorrect results.`,

        suggestion:
          `Ensure the left pointer is updated when window conditions are violated.`,

        exampleFix:
          `while (windowInvalid) {\n  left++;\n}`,

        metadata: {
          expandsWindow,
          shrinksWindow
        }

      });

    }

  });

  return detections;
}