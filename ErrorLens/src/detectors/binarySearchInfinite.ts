import { Issue } from '../models/Issue';

export function detectBinarySearchInfinite(path: any): Issue | null {
	if (path.node.type !== 'WhileStatement') {
		return null;
	}

	const testCode = path.get('test').toString();

	if (
		!testCode.includes('low') ||
		!testCode.includes('high')
	) {
		return null;
	}

	const bodyCode = path.get('body').toString();

	// must actually look like binary search
	if (!bodyCode.includes('mid')) {
		return null;
	}

	const updatesLow =
		bodyCode.includes('low =') ||
		bodyCode.includes('low++') ||
		bodyCode.includes('low +=') ||
		bodyCode.includes('low = mid');

	const updatesHigh =
		bodyCode.includes('high =') ||
		bodyCode.includes('high--') ||
		bodyCode.includes('high -=') ||
		bodyCode.includes('high = mid');

	if (updatesLow || updatesHigh) {
		return null;
	}

	const line = path.node.loc?.start?.line ?? 1;

	return {
		id: 'binary_search_infinite',
		title: 'Binary Search Infinite Loop Risk',
		concept: 'Binary Search Termination Logic',
		why: 'Binary search must shrink the search window every iteration.',
		visualization: `
low -------- mid -------- high
low/high unchanged
window never shrinks ❌
`,
		suggestion: 'Update low/high correctly inside the loop.',
		exampleFix: `
if (arr[mid] < target) {
	low = mid + 1;
} else {
	high = mid - 1;
}
`,
		line,
		severity: 'high'
	};
}