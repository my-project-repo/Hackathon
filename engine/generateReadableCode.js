function generateReadableCode(node) {

  if (!node) {
    return "";
  }

  switch(node.type) {

    case "Identifier":
      return node.name;

    case "NumericLiteral":
      return node.value.toString();

    case "MemberExpression":

      return (
        generateReadableCode(node.object)
        + "."
        + generateReadableCode(node.property)
      );

    default:
      return node.type;
  }
}