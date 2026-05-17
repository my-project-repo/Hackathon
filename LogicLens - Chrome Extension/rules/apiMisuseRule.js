function detectApiMisuse(ast, language) {

  const detections = [];

  traverseAst(ast, (node) => {

    // ===================================
    // JAVA
    // ===================================

    if (language === "java") {

      if (
        node.type === "MemberExpression"
      ) {

        const object =
          generateReadableCode(
            node.object
          );

        const property =
          generateReadableCode(
            node.property
          );

        // -----------------------------------
        // String.length misuse
        // -----------------------------------

        if (
          property === "length" &&
          looksLikeStringVariable(
            object
          )
        ) {

          detections.push({

            type:
              "JAVA_STRING_LENGTH_MISUSE",

            severity: "warning",

            message:
              `Possible incorrect String API usage: "${object}.length"`,

            explanation:
              "Java Strings use length() method, not length property.",

            suggestion:
              `Use "${object}.length()" instead.`,

            concept:
              "Language-specific API Semantics",

            topic:
              "Java String APIs",

            learningHint:
              "Java Strings use methods like length(), while arrays use length property.",

            metadata: {
              object
            }
          });
        }
      }
    }

    // ===================================
    // PYTHON
    // ===================================

    if (language === "python") {

      if (
        node.type === "MemberExpression"
      ) {

        const object =
          generateReadableCode(
            node.object
          );

        const property =
          generateReadableCode(
            node.property
          );

        // -----------------------------------
        // Python list.length misuse
        // -----------------------------------

        if (
          property === "length"
        ) {

          detections.push({

            type:
              "PYTHON_LENGTH_MISUSE",

            severity: "warning",

            message:
              `Possible incorrect Python list API usage: "${object}.length"`,

            explanation:
              "Python lists use len(arr), not arr.length.",

            suggestion:
              `Use "len(${object})" instead.`,

            concept:
              "Language-specific API Semantics",

            topic:
              "Python List Operations",

            learningHint:
              "Python lists use len(arr) instead of arr.length like JavaScript.",

            metadata: {
              object
            }
          });
        }
      }
    }

  });

  return detections;
}

// =====================================
// HELPERS
// =====================================

function looksLikeStringVariable(name) {

  const commonStringNames = [

    "s",
    "str",
    "string",
    "text",
    "word",
    "name",
    "input"

  ];

  return commonStringNames.includes(
    name.toLowerCase()
  );
}