import { Issue } from '../models/Issue';

function containsFloatLiteral(node: any): boolean {
	if (!node) {
		return false;
	}

	if (
		node.type === 'NumericLiteral' &&
		!Number.isInteger(node.value)
	) {
		return true;
	}

	if (node.left && containsFloatLiteral(node.left)) {
		return true;
	}

	if (node.right && containsFloatLiteral(node.right)) {
		return true;
	}

	return false;
}

export function detectFloatingPointEquality(path: any): Issue | null {
	if (path.node.type !== 'BinaryExpression') {
		return null;
	}

	const operator = path.node.operator;

	if (
		operator !== '==' &&
		operator !== '==='
	) {
		return null;
	}

	const hasFloat =
		containsFloatLiteral(path.node.left) ||
		containsFloatLiteral(path.node.right);

	if (!hasFloat) {
		return null;
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'floating_point_equality',
		title: 'Floating Point Equality Risk',
		concept: 'Numeric Precision',
		why: 'Floating point arithmetic can create precision mismatches.',
		visualization: `
0.1 + 0.2
= 0.30000000000000004
≠ 0.3
`,
		suggestion: 'Compare with tolerance instead of exact equality.',
		exampleFix: `
Math.abs(a - b) < 0.00001
`,
		line,
		severity: 'low'
	};
}