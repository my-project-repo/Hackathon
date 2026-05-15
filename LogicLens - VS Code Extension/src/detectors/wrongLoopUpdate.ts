import { Issue } from '../models/Issue';

export function detectWrongLoopUpdate(path: any): Issue | null {
	const update = path.node.update;
	const init = path.node.init;

	if (!update || !init) {
		return null;
	}

	if (
		init.type === 'VariableDeclaration' &&
		update.type === 'UpdateExpression'
	) {
		const declared = init.declarations[0]?.id?.name;
		const updated = update.argument?.name;

		if (declared && updated && declared !== updated) {
			const line = path.node.loc?.start?.line ?? 1;

			return {
				id: 'wrong_loop_update',
				title: 'Wrong Loop Variable Update',
				concept: 'Loop Control Logic',
				why: 'Updating the wrong loop variable can create infinite loops or incorrect iteration.',
				visualization: `
for (i = 0; ...; j++)

i controls loop
j updates ❌
`,
				suggestion: 'Update the same variable used in loop initialization.',
				exampleFix: `
for (let i = 0; i < 10; i++) {}
`,
				line,
				severity: 'medium'
			};
		}
	}

	return null;
}