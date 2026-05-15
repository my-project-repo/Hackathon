import { Issue } from '../models/Issue';

export function detectNullAccess(path: any): Issue | null {
	if (path.node.type !== 'MemberExpression') {
		return null;
	}

	// Ignore optional chaining-safe access
	if (path.node.optional) {
		return null;
	}

	const code = path.toString();

	// Only warn on deeper unsafe chains
	if (code.split('.').length < 3) {
		return null;
	}

	// Ignore chains already using optional chaining
	if (code.includes('?.')) {
		return null;
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'null_access',
		title: 'Unsafe Property Access Detected',
		concept: 'Null Reference Safety',
		why: 'Deep chained property access can fail if any intermediate value is null or undefined.',
		visualization: `
head
 └── next
      └── next
           ❌ if previous is null
`,
		suggestion: 'Use null checks or optional chaining.',
		exampleFix: `
head?.next?.next
`,
		line,
		severity: 'high'
	};
}