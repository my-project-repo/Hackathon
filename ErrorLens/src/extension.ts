import * as vscode from 'vscode';
import { analyzeDocument } from './analyzer';
import { LogicLensPanel } from './ui/panel';

let diagnosticCollection: vscode.DiagnosticCollection;
let debounceTimer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage('LogicLens activated');

	diagnosticCollection =
		vscode.languages.createDiagnosticCollection('logiclens');

	context.subscriptions.push(diagnosticCollection);

	const openPanelDisposable = vscode.commands.registerCommand(
		'logiclens.openPanel',
		() => {
			LogicLensPanel.createOrShow();
		}
	);

	context.subscriptions.push(openPanelDisposable);

	if (vscode.window.activeTextEditor) {
		analyzeDocument(
			vscode.window.activeTextEditor.document,
			diagnosticCollection
		);
	}

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			debounceTimer = setTimeout(() => {
				analyzeDocument(
					event.document,
					diagnosticCollection
				);
			}, 300);
		})
	);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				analyzeDocument(
					editor.document,
					diagnosticCollection
				);
			}
		})
	);
}

export function deactivate() {
	if (debounceTimer) {
		clearTimeout(debounceTimer);
	}

	if (diagnosticCollection) {
		diagnosticCollection.dispose();
	}
}