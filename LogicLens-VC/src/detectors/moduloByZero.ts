import { Issue } from '../models/Issue';

export function detectModuloByZero(path: any): Issue | null {
	if (path.node.type !== 'BinaryExpression') {
		return null;
	}

	if (path.node.operator !== '%') {
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
			id: 'modulo_by_zero',
			title: 'Modulo by Zero Risk',
			concept: 'Arithmetic Safety',
			why: 'Modulo with zero is invalid and can break execution.',
			visualization: `
10 % 0
  ↓
runtime failure
`,
			suggestion: 'Ensure divisor is non-zero.',
			exampleFix: `
if (divisor !== 0) {
	x = a % divisor;
}
`,
			line,
			severity: 'critical'
		};
	}

	return null;
}