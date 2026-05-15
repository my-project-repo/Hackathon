import { Issue } from '../models/Issue';

export function detectUnsafePop(path: any): Issue | null {
	if (path.node.type !== 'CallExpression') {
		return null;
	}

	const callee = path.node.callee;

	if (!callee || callee.type !== 'MemberExpression') {
		return null;
	}

	if (
		!callee.property ||
		callee.property.type !== 'Identifier'
	) {
		return null;
	}

	const riskyMethods = ['pop', 'shift'];

	if (!riskyMethods.includes(callee.property.name)) {
		return null;
	}

	// if inside loop, mutation detector handles it
	const loopParent = path.findParent((parent: any) =>
		parent.isForStatement() || parent.isWhileStatement()
	);

	if (loopParent) {
		return null;
	}

	const collectionName =
		callee.object?.type === 'Identifier'
			? callee.object.name
			: null;

	if (!collectionName) {
		return null;
	}

	const parentIf = path.findParent(
		(parent: any) => parent.isIfStatement()
	);

	if (parentIf) {
		const condition = parentIf.get('test').toString();

		if (
			condition.includes(`${collectionName}.length`)
		) {
			return null;
		}
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'unsafe_pop',
		title: 'Possible Unsafe Stack / Queue Removal',
		concept: 'Collection Safety',
		why: 'Removing from an empty collection can produce undefined values.',
		visualization: `
[]
 ↓
pop()
 ↓
undefined
`,
		suggestion: 'Check collection length before removing.',
		exampleFix: `
if (stack.length > 0) {
	stack.pop();
}
`,
		line,
		severity: 'high'
	};
}