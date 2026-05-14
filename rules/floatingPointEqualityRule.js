function detectFloatingPointEquality(ast) {

const detections = [];

traverseAst(ast, (node) => {

// Detect:
// a + b == c
// x === y
// result != 0.3

if (
node.type !== "BinaryExpression"
) {
return;
}

const riskyOperators = [
"==",
"===",
"!=",
"!=="
];

if (
!riskyOperators.includes(node.operator)
) {
return;
}

const leftSide =
generateReadableCode(node.left);

const rightSide =
generateReadableCode(node.right);

// Detect floating-point style expressions

const isFloatingPointExpression =
containsFloatingPointOperation(node.left) ||
containsFloatingPointOperation(node.right);

if (!isFloatingPointExpression) {
return;
}

detections.push({

type: "FLOATING_POINT_EQUALITY",

severity: "warning",

message:
`Floating-point equality comparison detected: "${leftSide} ${node.operator} ${rightSide}".`,

explanation:
`Floating-point arithmetic can introduce precision errors, making direct equality comparisons unreliable.`,

suggestion:
`Consider comparing using an epsilon tolerance instead of "${node.operator}".`,

exampleFix:
`Math.abs(${leftSide} - ${rightSide}) < Number.EPSILON`,

metadata: {
operator: node.operator,
left: leftSide,
right: rightSide
}

});

});

return detections;
}

function containsFloatingPointOperation(node) {

if (!node) {
return false;
}

// Numeric literal with decimal
if (
node.type === "Literal" &&
typeof node.value === "number" &&
!Number.isInteger(node.value)
) {
return true;
}

// Arithmetic operation
if (
node.type === "BinaryExpression"
) {

const arithmeticOperators = [
"+",
"-",
"*",
"/",
"%"
];

if (
arithmeticOperators.includes(node.operator)
) {
return true;
}

return (
containsFloatingPointOperation(node.left) ||
containsFloatingPointOperation(node.right)
);
}

// Math methods
if (
node.type === "CallExpression" &&
node.callee &&
node.callee.object &&
node.callee.object.name === "Math"
) {
return true;
}

return false;
}