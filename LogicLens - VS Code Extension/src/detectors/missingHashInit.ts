import { Issue } from '../models/Issue';

export function detectMissingHashInit(path: any): Issue | null {
	if (path.node.type !== 'CallExpression') {
		return null;
	}

	const callee = path.node.callee;

	if (
		!callee ||
		callee.type !== 'MemberExpression'
	) {
		return null;
	}

	if (
		!callee.object ||
		callee.object.type !== 'MemberExpression'
	) {
		return null;
	}

	if (
		!callee.property ||
		callee.property.type !== 'Identifier' ||
		callee.property.name !== 'push'
	) {
		return null;
	}

	const innerObject = callee.object;

	if (!innerObject.computed) {
		return null;
	}

	const mapName =
		innerObject.object?.type === 'Identifier'
			? innerObject.object.name
			: null;

	if (!mapName) {
		return null;
	}

	const parentIf = path.findParent(
		(parent: any) => parent.isIfStatement()
	);

	if (parentIf) {
		const condition = parentIf.get('test').toString();

		if (
			condition.includes(`${mapName}[`) ||
			condition.includes(`!${mapName}[`)
		) {
			return null;
		}
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'missing_hash_init',
		title: 'Possible Missing HashMap Initialization',
		concept: 'HashMap Safety',
		why: 'Using map[key] assumes that key already exists.',
		visualization: `
map["a"] → undefined
undefined.push()
        ❌
`,
		suggestion: 'Initialize the collection before push().',
		exampleFix: `
if (!map[key]) {
	map[key] = [];
}

map[key].push(value);
`,
		line,
		severity: 'high'
	};
}