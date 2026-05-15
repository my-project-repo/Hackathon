import { Issue } from '../models/Issue';

export function detectOffByOne(path: any): Issue | null {
	const test = path.node.test;

	if (
		test &&
		test.type === 'BinaryExpression' &&
		test.operator === '<=' &&
		test.right.type === 'MemberExpression' &&
		test.right.property.type === 'Identifier' &&
		test.right.property.name === 'length'
	) {
		const line = test.loc?.start?.line ?? 1;

		return {
			id: 'off_by_one',
			title: 'Possible Off-by-One Error',
			concept: 'Array Boundary Logic',
			why: 'Arrays are indexed from 0 to length - 1. Using <= reaches one index too far.',
			visualization: `
Indexes:
0   1   2
A   B   C

length = 3
loop goes to index 3 ❌
`,
			suggestion: 'Use < instead of <= for array traversal.',
			exampleFix: `
for (let i = 0; i < arr.length; i++) {}
`,
			line,
			severity: 'medium'
		};
	}

	return null;
}