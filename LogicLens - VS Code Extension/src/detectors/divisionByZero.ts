import { Issue } from '../models/Issue';

export function detectDivisionByZero(path: any): Issue | null {
	if (path.node.type !== 'BinaryExpression') {
		return null;
	}

	if (path.node.operator !== '/') {
		return null;
	}

	const right = path.node.right;

	if (
		right &&
		right.type === 'NumericLiteral' &&
		right.value === 0
	) {
		const line = path.node.loc?.start?.line ?? 1;

		return {
			id: 'division_by_zero',
			title: 'Division by Zero Risk',
			concept: 'Arithmetic Safety',
			why: 'Division by zero creates invalid numeric behavior.',
			visualization: `
10 / 0
  ↓
undefined / invalid
`,
			suggestion: 'Validate denominator before division.',
			exampleFix: `
if (denominator !== 0) {
	result = a / denominator;
}
`,
			line,
			severity: 'critical'
		};
	}

	return null;
}