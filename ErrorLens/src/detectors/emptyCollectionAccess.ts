import { Issue } from '../models/Issue';

export function detectEmptyCollectionAccess(path: any): Issue | null {
	if (path.node.type !== 'MemberExpression') {
		return null;
	}

	if (!path.node.computed) {
		return null;
	}

	if (
		!path.node.property ||
		path.node.property.type !== 'NumericLiteral' ||
		path.node.property.value !== 0
	) {
		return null;
	}

	const collectionName =
		path.node.object?.type === 'Identifier'
			? path.node.object.name
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
			condition.includes(`${collectionName}.length`) ||
			condition.includes(`${collectionName}.length > 0`) ||
			condition.includes(`${collectionName}.length !== 0`)
		) {
			return null;
		}
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'empty_collection_access',
		title: 'Possible Empty Collection Access',
		concept: 'Collection Safety',
		why: 'Accessing the first element assumes the collection is not empty.',
		visualization: `
[]
 ↓
arr[0]
 ↓
undefined
`,
		suggestion: 'Check length before accessing.',
		exampleFix: `
if (arr.length > 0) {
	arr[0];
}
`,
		line,
		severity: 'low'
	};
}