import { Issue } from '../models/Issue';

export function detectMissingReturn(path: any): Issue | null {
	if (path.node.type !== 'FunctionDeclaration') {
		return null;
	}

	const functionName = path.node.id?.name;

	if (!functionName) {
		return null;
	}

	const valueLikePrefixes = [
		'get',
		'find',
		'calculate',
		'compute',
		'build',
		'create',
		'make',
		'parse',
		'convert',
		'sum',
		'add'
	];

	const looksValueProducing = valueLikePrefixes.some(prefix =>
		functionName.toLowerCase().startsWith(prefix)
	);

	if (!looksValueProducing) {
		return null;
	}

	let hasReturn = false;

	path.traverse({
		ReturnStatement() {
			hasReturn = true;
		}
	});

	if (hasReturn) {
		return null;
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'missing_return',
		title: 'Possible Missing Return Statement',
		concept: 'Function Logic',
		why: 'This function appears intended to produce a value but does not return one.',
		visualization: `
function getData() {
	const x = 5;
}
↓
returns undefined
`,
		suggestion: 'Return the intended result explicitly.',
		exampleFix: `
return x;
`,
		line,
		severity: 'low'
	};
}