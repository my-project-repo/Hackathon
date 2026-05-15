import { Issue } from '../models/Issue';

export function detectBinarySearchBoundary(path: any): Issue | null {
	if (path.node.type !== 'BinaryExpression') {
		return null;
	}

	// avoid nested duplicate detection
	if (
		path.parent &&
		path.parent.type === 'CallExpression'
	) {
		return null;
	}

	if (path.node.operator !== '/') {
		return null;
	}

	const left = path.node.left;
	const right = path.node.right;

	if (
		!left ||
		left.type !== 'BinaryExpression' ||
		left.operator !== '+'
	) {
		return null;
	}

	if (
		!right ||
		right.type !== 'NumericLiteral' ||
		right.value !== 2
	) {
		return null;
	}

	const leftName =
		left.left?.type === 'Identifier'
			? left.left.name
			: null;

	const rightName =
		left.right?.type === 'Identifier'
			? left.right.name
			: null;

	if (
		!(
			(leftName === 'low' && rightName === 'high') ||
			(leftName === 'high' && rightName === 'low')
		)
	) {
		return null;
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'binary_search_boundary',
		title: 'Binary Search Midpoint Risk',
		concept: 'Binary Search Boundaries',
		why: 'Classic midpoint calculation can cause overflow or boundary issues.',
		visualization: `
(low + high) / 2
classic midpoint risk
`,
		suggestion: 'Use low + (high - low) / 2.',
		exampleFix: `
let mid = low + Math.floor((high - low) / 2);
`,
		line,
		severity: 'medium'
	};
}