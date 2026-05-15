import { Issue } from '../models/Issue';

export function detectAssignmentInCondition(path: any): Issue | null {
	const test = path.node.test;

	if (
		test &&
		test.type === 'AssignmentExpression'
	) {
		const line = test.loc?.start?.line ?? 1;

		return {
			id: 'assignment_condition',
			title: 'Assignment Used Inside Condition',
			concept: 'Conditional Logic',
			why: 'Assignment inside conditions is often accidental and changes program state unexpectedly.',
			visualization: `
if (x = 5)
    ↓
x becomes 5
not comparison ❌
`,
			suggestion: 'Use comparison operators instead.',
			exampleFix: `
if (x === 5)
`,
			line,
			severity: 'low'
		};
	}

	return null;
}