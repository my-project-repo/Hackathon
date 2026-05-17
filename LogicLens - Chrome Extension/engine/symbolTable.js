function buildSymbolTable(ast) {

  const symbolTable = {};

  traverseAst(ast, (node) => {

    // =====================================
    // Variable declarations
    // =====================================

    if (
      node.type !== "VariableDeclarator"
    ) {
      return;
    }

    const variableName =
      node.id?.name;

    if (!variableName) {
      return;
    }

    let inferredType =
      "unknown";

    const init =
      node.init;

    // =====================================
    // No initializer
    // let x;
    // =====================================

    if (!init) {

      inferredType = "undefined";

    }

    // =====================================
    // Array
    // let nums = []
    // =====================================

    else if (
      init.type ===
        "ArrayExpression"
    ) {

      inferredType = "array";

    }

    // =====================================
    // Object / HashMap
    // let map = {}
    // =====================================

    else if (
      init.type ===
        "ObjectExpression"
    ) {

      inferredType = "object";

    }

    // =====================================
    // String
    // let s = "hello"
    // =====================================

    else if (
      init.type ===
        "StringLiteral"
    ) {

      inferredType = "string";

    }

    // =====================================
    // Number
    // let age = 21
    // =====================================

    else if (
      init.type ===
        "NumericLiteral"
    ) {

      inferredType = "number";

    }

    // =====================================
    // Boolean
    // let flag = true
    // =====================================

    else if (
      init.type ===
        "BooleanLiteral"
    ) {

      inferredType = "boolean";

    }

    // =====================================
    // Null
    // let node = null
    // =====================================

    else if (
      init.type ===
        "NullLiteral"
    ) {

      inferredType = "null";

    }

    // =====================================
    // Function
    // =====================================

    else if (

      init.type ===
        "FunctionExpression" ||

      init.type ===
        "ArrowFunctionExpression"

    ) {

      inferredType = "function";

    }

    // =====================================
    // New Expressions
    // new Map()
    // new Set()
    // new Array()
    // =====================================

    else if (
      init.type ===
        "NewExpression"
    ) {

      const className =
        generateReadableCode(
          init.callee
        );

      if (
        className === "Map"
      ) {

        inferredType = "map";

      }

      else if (
        className === "Set"
      ) {

        inferredType = "set";

      }

      else if (
        className === "Array"
      ) {

        inferredType = "array";

      }

      else {

        inferredType =
          `instance:${className}`;

      }

    }

    // =====================================
    // Binary Expression
    // let x = a + b
    // =====================================

    else if (
      init.type ===
        "BinaryExpression"
    ) {

      if (
        init.operator === "+"
      ) {

        inferredType =
          "number|string";

      } else {

        inferredType =
          "number";

      }

    }

    // =====================================
    // Template Literal
    // =====================================

    else if (
      init.type ===
        "TemplateLiteral"
    ) {

      inferredType = "string";

    }

    // =====================================
    // CallExpression Heuristics
    // =====================================

    else if (
      init.type ===
        "CallExpression"
    ) {

      const calledFunction =
        generateReadableCode(
          init.callee
        );

      // =====================================
      // Array creators
      // =====================================

      if (

        calledFunction ===
          "Array.from" ||

        calledFunction ===
          "Array.of"

      ) {

        inferredType =
          "array";

      }

      // =====================================
      // String creators
      // =====================================

      else if (

        calledFunction ===
          "String"

      ) {

        inferredType =
          "string";

      }

      // =====================================
      // Number creators
      // =====================================

      else if (

        calledFunction ===
          "Number" ||

        calledFunction ===
          "parseInt" ||

        calledFunction ===
          "parseFloat"

      ) {

        inferredType =
          "number";

      }

      // =====================================
      // Boolean creators
      // =====================================

      else if (

        calledFunction ===
          "Boolean"

      ) {

        inferredType =
          "boolean";

      }

      // =====================================
      // Promise
      // =====================================

      else if (

        calledFunction ===
          "Promise"

      ) {

        inferredType =
          "promise";

      }

    }

    // =====================================
    // Usage-Based Heuristics
    // =====================================

    if (
      inferredType === "unknown"
    ) {

      traverseAst(ast, (child) => {

        // =====================================
        // arr.push()
        // =====================================

        if (
          child.type ===
            "CallExpression" &&
          child.callee &&
          child.callee.type ===
            "MemberExpression"
        ) {

          const objectName =
            generateReadableCode(
              child.callee.object
            );

          const methodName =
            generateReadableCode(
              child.callee.property
            );

          if (
            objectName ===
            variableName
          ) {

            if (

              methodName ===
                "push" ||

              methodName ===
                "pop" ||

              methodName ===
                "shift" ||

              methodName ===
                "unshift"

            ) {

              inferredType =
                "array";

            }

            if (

              methodName ===
                "has" ||

              methodName ===
                "add"

            ) {

              inferredType =
                "set";

            }

            if (

              methodName ===
                "get" ||

              methodName ===
                "set"

            ) {

              inferredType =
                "map";

            }

          }

        }

      });

    }

    // =====================================
    // Store symbol
    // =====================================

    symbolTable[variableName] = {

      type: inferredType,

      declaredAt:
        node.start

    };

  });

  return symbolTable;

}