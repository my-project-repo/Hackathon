import { Issue } from '../models/Issue';

export function detectEmptyLoop(path: any): Issue | null {
	if (
		path.node.body &&
		path.node.body.type === 'EmptyStatement'
	) {
		const line = path.node.loc?.start?.line ?? 1;

		return {
			id: 'empty_loop',
			title: 'Empty Loop Body Detected',
			concept: 'Loop Syntax',
			why: 'A stray semicolon can make the loop body empty.',
			visualization: `
for (...) ;
         ↑ stray semicolon
`,
			suggestion: 'Remove the semicolon and add intended logic.',
			exampleFix: `
for (...) {
	doWork();
}
`,
			line,
			severity: 'low'
		};
	}

	return null;
}