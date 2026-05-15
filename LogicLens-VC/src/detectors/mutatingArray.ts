import { Issue } from '../models/Issue';

export function detectMutatingArray(path: any): Issue | null {
	const node = path.node;

	if (!node || node.type !== 'CallExpression') {
		return null;
	}

	if (!node.callee || node.callee.type !== 'MemberExpression') {
		return null;
	}

	if (
		node.callee.property.type !== 'Identifier'
	) {
		return null;
	}

	const riskyMethods = ['pop', 'shift', 'splice'];

	if (!riskyMethods.includes(node.callee.property.name)) {
		return null;
	}

	const loopParent = path.findParent((parent: any) =>
		parent.isForStatement() || parent.isWhileStatement()
	);

	if (!loopParent) {
		return null;
	}

	const line = node.loc?.start?.line ?? 1;

	return {
		id: 'mutating_array',
		title: 'Mutating Array During Iteration',
		concept: 'Collection Mutation Safety',
		why: 'Mutating arrays during iteration can shift indexes and skip elements.',
		visualization: `
[1,2,3,4]
 ↓ pop()
[1,2,3]

indexes shifted ❌
`,
		suggestion: 'Iterate over a copy or avoid mutating inside the loop.',
		exampleFix: `
for (const x of [...arr]) {}
`,
		line,
		severity: 'medium'
	};
}