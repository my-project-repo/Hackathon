function traverseAst(node, callback) {

  if (!node) {
    return;
  }

  callback(node);

  for (const key in node) {

    const value = node[key];

    if (Array.isArray(value)) {

      value.forEach(child => {

        if (
          child &&
          typeof child === "object"
        ) {
          traverseAst(child, callback);
        }

      });

    } else if (
      value &&
      typeof value === "object"
    ) {

      traverseAst(value, callback);
    }
  }
}