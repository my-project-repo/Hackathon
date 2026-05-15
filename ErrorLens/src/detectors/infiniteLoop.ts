import { Issue } from '../models/Issue';

export function detectInfiniteLoop(path: any): Issue | null {
	if (path.node.type !== 'WhileStatement') {
		return null;
	}

	const test = path.node.test;

	if (
		test &&
		test.type === 'BooleanLiteral' &&
		test.value === true
	) {
		const bodyCode = path.toString();

		if (
			!bodyCode.includes('break') &&
			!bodyCode.includes('return')
		) {
			const line = path.node.loc?.start?.line ?? 1;

			return {
				id: 'infinite_loop',
				title: 'Infinite Loop Risk Detected',
				concept: 'Loop Termination Logic',
				why: 'A loop without termination can freeze execution indefinitely.',
				visualization: `
while(true)
   ↓
runs forever
   ↓
CPU burn / freeze
`,
				suggestion: 'Add a terminating condition or explicit break.',
				exampleFix: `
while (condition) {
	if (done) break;
}
`,
				line,
				severity: 'critical'
			};
		}
	}

	return null;
}