function parseJavaScript(code) {

  try {

    return Babel.packages.parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"]
    });

  } catch(error) {

    console.error(
      "JavaScript Parse Error:",
      error
    );

    return null;
  }
}