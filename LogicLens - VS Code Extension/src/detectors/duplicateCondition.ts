import { Issue } from '../models/Issue';

export function detectDuplicateCondition(path: any): Issue | null {
	const node = path.node;

	if (!node.alternate || node.alternate.type !== 'IfStatement') {
		return null;
	}

	const currentCondition = path.get('test').toString();
	const alternateCondition = path.get('alternate.test').toString();

	if (currentCondition !== alternateCondition) {
		return null;
	}

	const line = node.loc?.start?.line ?? 1;

	return {
		id: 'duplicate_condition',
		title: 'Duplicate Condition Detected',
		concept: 'Conditional Logic',
		why: 'Duplicate conditions make one branch redundant.',
		visualization: `
if (score > 90)
else if (score > 90)

same condition twice ❌
`,
		suggestion: 'Ensure each branch checks a unique case.',
		exampleFix: `
else if (score > 80)
`,
		line,
		severity: 'medium'
	};
}