function inferType(node, symbolTable = {}) {

  if (!node) {
    return "unknown";
  }

  // =====================================
  // DIRECT LITERALS
  // =====================================

  if (
    node.type === "StringLiteral"
  ) {

    return "string";

  }

  if (
    node.type === "NumericLiteral"
  ) {

    return "number";

  }

  if (
    node.type === "BooleanLiteral"
  ) {

    return "boolean";

  }

  if (
    node.type === "NullLiteral"
  ) {

    return "null";

  }

  // =====================================
  // ARRAYS / OBJECTS
  // =====================================

  if (
    node.type ===
      "ArrayExpression"
  ) {

    return "array";

  }

  if (
    node.type ===
      "ObjectExpression"
  ) {

    return "object";

  }

  // =====================================
  // FUNCTIONS
  // =====================================

  if (

    node.type ===
      "FunctionExpression" ||

    node.type ===
      "ArrowFunctionExpression" ||

    node.type ===
      "FunctionDeclaration"

  ) {

    return "function";

  }

  // =====================================
  // IDENTIFIER LOOKUP
  // =====================================

  if (
    node.type === "Identifier"
  ) {

    const variableName =
      node.name;

    if (
      symbolTable[variableName]
    ) {

      return (
        symbolTable[
          variableName
        ].type
      );

    }

  }

  // =====================================
  // TEMPLATE LITERALS
  // =====================================

  if (
    node.type ===
      "TemplateLiteral"
  ) {

    return "string";

  }

  // =====================================
  // NEW EXPRESSIONS
  // =====================================

  if (
    node.type ===
      "NewExpression"
  ) {

    const className =
      generateReadableCode(
        node.callee
      );

    if (
      className === "Map"
    ) {

      return "map";

    }

    if (
      className === "Set"
    ) {

      return "set";

    }

    if (
      className === "Array"
    ) {

      return "array";

    }

    return `instance:${className}`;

  }

  // =====================================
  // BINARY EXPRESSIONS
  // =====================================

  if (
    node.type ===
      "BinaryExpression"
  ) {

    if (
      node.operator === "+"
    ) {

      const leftType =
        inferType(
          node.left,
          symbolTable
        );

      const rightType =
        inferType(
          node.right,
          symbolTable
        );

      if (
        leftType === "string" ||
        rightType === "string"
      ) {

        return "string";

      }

      return "number";

    }

    return "number";

  }

  // =====================================
  // MEMBER EXPRESSIONS
  // =====================================

  if (
    node.type ===
      "MemberExpression"
  ) {

    const property =
      generateReadableCode(
        node.property
      );

    // arr.length
    if (
      property === "length"
    ) {

      return "number";

    }

  }

  // =====================================
  // CALL EXPRESSIONS
  // =====================================

  if (
    node.type ===
      "CallExpression"
  ) {

    const functionName =
      generateReadableCode(
        node.callee
      );

    // =====================================
    // NUMBER FUNCTIONS
    // =====================================

    if (

      functionName ===
        "parseInt" ||

      functionName ===
        "parseFloat" ||

      functionName ===
        "Number"

    ) {

      return "number";

    }

    // =====================================
    // STRING FUNCTIONS
    // =====================================

    if (
      functionName === "String"
    ) {

      return "string";

    }

    // =====================================
    // BOOLEAN FUNCTIONS
    // =====================================

    if (
      functionName ===
        "Boolean"
    ) {

      return "boolean";

    }

    // =====================================
    // ARRAY CREATORS
    // =====================================

    if (

      functionName ===
        "Array.from" ||

      functionName ===
        "Array.of"

    ) {

      return "array";

    }

    // =====================================
    // PROMISES
    // =====================================

    if (
      functionName ===
        "Promise"
    ) {

      return "promise";

    }

  }

  // =====================================
  // FALLBACK
  // =====================================

  return "unknown";

}