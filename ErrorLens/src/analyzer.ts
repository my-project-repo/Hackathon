import * as vscode from 'vscode';
import { parse } from '@babel/parser';
const traverse = require('@babel/traverse').default;

import { LogicLensPanel } from './ui/panel';
import { Issue } from './models/Issue';
import { runDetectors } from './detectors/detectorRegistry';

function getDiagnosticSeverity(
	severity: Issue['severity']
): vscode.DiagnosticSeverity {
	switch (severity) {
		case 'critical':
			return vscode.DiagnosticSeverity.Error;

		case 'high':
			return vscode.DiagnosticSeverity.Warning;

		case 'medium':
			return vscode.DiagnosticSeverity.Information;

		case 'low':
			return vscode.DiagnosticSeverity.Hint;

		default:
			return vscode.DiagnosticSeverity.Warning;
	}
}

function createDiagnostic(issue: Issue): vscode.Diagnostic {
	const range = new vscode.Range(
		new vscode.Position(issue.line - 1, 0),
		new vscode.Position(issue.line - 1, 100)
	);

	const diagnostic = new vscode.Diagnostic(
		range,
		issue.title,
		getDiagnosticSeverity(issue.severity)
	);

	diagnostic.source = 'LogicLens';

	return diagnostic;
}

function severityRank(severity: Issue['severity']): number {
	switch (severity) {
		case 'critical':
			return 1;

		case 'high':
			return 2;

		case 'medium':
			return 3;

		case 'low':
			return 4;

		default:
			return 999;
	}
}

function sortIssues(issues: Issue[]): Issue[] {
	return issues.sort((a, b) => {
		const severityDiff =
			severityRank(a.severity) - severityRank(b.severity);

		if (severityDiff !== 0) {
			return severityDiff;
		}

		return a.line - b.line;
	});
}

export function analyzeDocument(
	document: vscode.TextDocument,
	diagnosticCollection: vscode.DiagnosticCollection
) {
	if (
		document.languageId !== 'javascript' &&
		document.languageId !== 'typescript'
	) {
		diagnosticCollection.clear();
		LogicLensPanel.showEmptyState();
		return;
	}

	const code = document.getText();
	const diagnostics: vscode.Diagnostic[] = [];
	const allIssues: Issue[] = [];
	const seenIssues = new Set<string>();

	try {
		const ast = parse(code, {
			sourceType: 'module',
			plugins: ['typescript']
		});

		traverse(ast, {
			enter(path: any) {
				const issues = runDetectors(path);

				for (const issue of issues) {
					const key = `${issue.id}:${issue.line}`;

if (!seenIssues.has(key)) {
	seenIssues.add(key);
	allIssues.push(issue);
	diagnostics.push(createDiagnostic(issue));
}
				}
			}
		});

		const sortedIssues = sortIssues(allIssues);

		diagnosticCollection.set(document.uri, diagnostics);

		if (sortedIssues.length > 0) {
			LogicLensPanel.showIssues(sortedIssues);
		} else {
			LogicLensPanel.showEmptyState();
		}
	} catch (error) {
		console.error('Parsing error:', error);
		diagnosticCollection.clear();
		LogicLensPanel.showEmptyState();
	}
}