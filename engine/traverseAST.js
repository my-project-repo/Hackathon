function traverseAst(
  node,
  callback,
  parent = null
) {

  if (!node) {
    return;
  }

  node.parent = parent;

  callback(node);

  for (const key in node) {

    if (key === "parent") {
      continue;
    }

    const value = node[key];

    if (Array.isArray(value)) {

      value.forEach((child) => {

        if (
          child &&
          typeof child === "object"
        ) {

          traverseAst(
            child,
            callback,
            node
          );
        }

      });

    } else if (
      value &&
      typeof value === "object"
    ) {

      traverseAst(
        value,
        callback,
        node
      );
    }
  }
}