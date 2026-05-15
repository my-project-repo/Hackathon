import { Issue } from '../models/Issue';

export function detectMissingRecursionBase(path: any): Issue | null {
	if (path.node.type !== 'FunctionDeclaration') {
		return null;
	}

	if (!path.node.id) {
		return null;
	}

	const functionName = path.node.id.name;
	let hasRecursiveCall = false;
	let hasConditional = false;

	path.traverse({
		CallExpression(innerPath: any) {
			const callee = innerPath.node.callee;

			if (
				callee &&
				callee.type === 'Identifier' &&
				callee.name === functionName
			) {
				hasRecursiveCall = true;
			}
		},

		IfStatement() {
			hasConditional = true;
		}
	});

	if (hasRecursiveCall && !hasConditional) {
		const line = path.node.loc?.start?.line ?? 1;

		return {
			id: 'missing_recursion_base',
			title: 'Missing Recursion Base Case',
			concept: 'Recursive Termination Logic',
			why: 'Recursive functions need a stopping condition to terminate safely.',
			visualization: `
solve(5)
 → solve(4)
   → solve(3)
     → solve(2)
       → endless recursion
`,
			suggestion: 'Add a terminating if-condition before recursive calls.',
			exampleFix: `
if (n === 0) return;
`,
			line,
			severity: 'critical'
		};
	}

	return null;
}