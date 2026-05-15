import { Issue } from '../models/Issue';

export function detectUnreachableCode(path: any): Issue | null {
	const parent = path.parentPath;

	if (!parent || !Array.isArray(parent.node.body)) {
		return null;
	}

	const body = parent.node.body;
	const index = body.indexOf(path.node);

	if (index === -1 || index >= body.length - 1) {
		return null;
	}

	const nextNode = body[index + 1];
	const line = nextNode.loc?.start?.line ?? 1;

	return {
		id: 'unreachable_code',
		title: 'Unreachable Code Detected',
		concept: 'Control Flow',
		why: 'Code after return will never execute.',
		visualization: `
return x;
console.log("never runs") ❌
`,
		suggestion: 'Move code before return or remove dead logic.',
		exampleFix: `
console.log(x);
return x;
`,
		line,
		severity: 'medium'
	};
}