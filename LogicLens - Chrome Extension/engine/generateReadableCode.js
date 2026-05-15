function generateReadableCode(node) {

  if (!node) {
    return "";
  }

  switch(node.type) {

    // ===================================
    // IDENTIFIERS
    // ===================================

    case "Identifier":
      return node.name;

    // ===================================
    // LITERALS
    // ===================================

    case "NumericLiteral":
    case "StringLiteral":
    case "BooleanLiteral":

      return String(node.value);

    // ===================================
    // MEMBER EXPRESSIONS
    // ===================================

    case "MemberExpression":

      return (
        generateReadableCode(
          node.object
        )
        + "."
        + generateReadableCode(
          node.property
        )
      );

    // ===================================
    // CALL EXPRESSIONS
    // ===================================

    case "CallExpression":

      return (
        generateReadableCode(
          node.callee
        )
        + "()"
      );

    // ===================================
    // BINARY EXPRESSIONS
    // ===================================

    case "BinaryExpression":

      return (
        generateReadableCode(
          node.left
        )
        + " "
        + node.operator
        + " "
        + generateReadableCode(
          node.right
        )
      );

    // ===================================
    // ASSIGNMENT EXPRESSIONS
    // ===================================

    case "AssignmentExpression":

      return (
        generateReadableCode(
          node.left
        )
        + " "
        + node.operator
        + " "
        + generateReadableCode(
          node.right
        )
      );

    // ===================================
    // UPDATE EXPRESSIONS
    // ===================================

    case "UpdateExpression":

      return (
        generateReadableCode(
          node.argument
        )
        + node.operator
      );

    // ===================================
    // THIS
    // ===================================

    case "ThisExpression":
      return "this";

    // ===================================
    // FALLBACK
    // ===================================

    default:
      return node.type;
  }
}