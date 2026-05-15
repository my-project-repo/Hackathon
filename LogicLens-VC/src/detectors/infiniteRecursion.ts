import { Issue } from '../models/Issue';

export function detectInfiniteRecursion(path: any): Issue | null {
	if (path.node.type !== 'CallExpression') {
		return null;
	}

	const parentFunction = path.getFunctionParent();

	if (!parentFunction?.node?.id) {
		return null;
	}

	const functionName = parentFunction.node.id.name;
	const callee = path.node.callee;

	if (
		!callee ||
		callee.type !== 'Identifier' ||
		callee.name !== functionName
	) {
		return null;
	}

	// if function contains conditionals, assume some termination logic exists
	let hasConditional = false;

	parentFunction.traverse({
		IfStatement() {
			hasConditional = true;
		}
	});

	if (hasConditional) {
		return null;
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'infinite_recursion',
		title: 'Infinite Recursion Risk Detected',
		concept: 'Recursive Execution Flow',
		why: 'A function calling itself without guaranteed termination can exhaust the call stack.',
		visualization: `
solve()
 └── solve()
      └── solve()
           └── STACK OVERFLOW
`,
		suggestion: 'Ensure recursion has a clear terminating condition.',
		exampleFix: `
function solve(n) {
	if (n <= 0) return;
	return solve(n - 1);
}
`,
		line,
		severity: 'critical'
	};
}