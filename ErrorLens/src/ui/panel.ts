import * as vscode from 'vscode';
import { Issue } from '../models/Issue';

export class LogicLensPanel {
	private static panel: vscode.WebviewPanel | undefined;
	private static lastSignature: string | null = null;
	private static currentIssues: Issue[] = [];
	private static selectedIndex = 0;

	public static createOrShow() {
		if (LogicLensPanel.panel) {
			LogicLensPanel.panel.reveal(vscode.ViewColumn.Beside);
			return;
		}

		LogicLensPanel.panel = vscode.window.createWebviewPanel(
			'logiclens',
			'⚡ LogicLens',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true
			}
		);

		LogicLensPanel.panel.webview.onDidReceiveMessage((message) => {
			if (message.command === 'selectIssue') {
				LogicLensPanel.selectedIndex = message.index;

				if (LogicLensPanel.panel) {
					LogicLensPanel.panel.webview.html =
						LogicLensPanel.getDashboardHtml(
							LogicLensPanel.currentIssues,
							message.queueScroll || 0
						);
				}
			}
		});

		LogicLensPanel.panel.onDidDispose(() => {
			LogicLensPanel.panel = undefined;
			LogicLensPanel.lastSignature = null;
			LogicLensPanel.currentIssues = [];
			LogicLensPanel.selectedIndex = 0;
		});

		LogicLensPanel.panel.webview.html =
			LogicLensPanel.getEmptyHtml();
	}

	public static showEmptyState() {
		if (!LogicLensPanel.panel) {
			LogicLensPanel.createOrShow();
		}

		LogicLensPanel.lastSignature = null;

		if (!LogicLensPanel.panel) {
			return;
		}

		LogicLensPanel.panel.webview.html =
			LogicLensPanel.getEmptyHtml();
	}

	public static showIssues(issues: Issue[]) {
		if (!LogicLensPanel.panel) {
			LogicLensPanel.createOrShow();
		}

		if (!LogicLensPanel.panel || issues.length === 0) {
			return;
		}

		const signature = issues
			.map(i => `${i.id}:${i.line}`)
			.join('|');

		if (signature === LogicLensPanel.lastSignature) {
			return;
		}

		LogicLensPanel.lastSignature = signature;
		LogicLensPanel.currentIssues = issues;

		if (LogicLensPanel.selectedIndex >= issues.length) {
			LogicLensPanel.selectedIndex = 0;
		}

		LogicLensPanel.panel.webview.html =
			LogicLensPanel.getDashboardHtml(issues, 0);
	}

	private static severityColor(severity: string): string {
		switch (severity) {
			case 'critical':
				return '#ff2222';

			case 'high':
				return '#ff8800';

			case 'medium':
				return '#ffd000';

			case 'low':
				return '#00ffaa';

			default:
				return '#00ff88';
		}
	}

	private static getEmptyHtml(): string {
		return `
		<!DOCTYPE html>
		<html>
		<body style="
			background:#050505;
			color:#00ff88;
			font-family:Cascadia Code, monospace;
			padding:24px;
		">
			<h1 style="color:#ff4d4d;">⚡ LOGICLENS</h1>
			<h3 style="color:#ff4d4d;">SYSTEM READY</h3>
			<p>Monitoring logic patterns... awaiting anomaly detection.</p>
		</body>
		</html>
		`;
	}

	private static getDashboardHtml(
		issues: Issue[],
		queueScroll = 0
	): string {
		const selected =
			issues[LogicLensPanel.selectedIndex] || issues[0];

		const issueList = issues
			.map((issue, index) => `
				<div
					onclick="selectIssue(${index})"
					style="
						cursor:pointer;
						border:1px solid ${LogicLensPanel.severityColor(issue.severity)};
						padding:10px;
						margin-bottom:10px;
						background:#0b0b0b;
						border-radius:8px;
						transition:0.15s;
					"
				>
					<div style="
						color:${LogicLensPanel.severityColor(issue.severity)};
						font-weight:bold;
						font-size:12px;
					">
						${issue.severity.toUpperCase()}
					</div>

					<div style="color:#ffffff; margin-top:6px;">
						${issue.title}
					</div>

					<div style="color:#888; font-size:12px; margin-top:4px;">
						Line ${issue.line}
					</div>
				</div>
			`)
			.join('');

		return `
		<!DOCTYPE html>
		<html>
		<body style="
			margin:0;
			background:#050505;
			color:#00ff88;
			font-family:Cascadia Code, monospace;
			height:100vh;
			display:flex;
		">
			<div
				id="threatQueue"
				style="
					width:34%;
					border-right:1px solid #222;
					padding:18px;
					overflow-y:auto;
					background:#070707;
				"
			>
				<h2 style="color:#ff4d4d;">
					⚡ Total Threats (${issues.length})
				</h2>

				${issueList}
			</div>

			<div style="
				width:66%;
				padding:24px;
				overflow-y:auto;
			">
				<h1 style="color:#ff4d4d;">
					${selected.title}
				</h1>

				<div style="
					display:inline-block;
					padding:8px 14px;
					border-radius:999px;
					background:${LogicLensPanel.severityColor(selected.severity)};
					color:black;
					font-weight:bold;
					margin-bottom:20px;
				">
					${selected.severity.toUpperCase()}
				</div>

				<h3 style="color:#ff4d4d;">Concept</h3>
				<p>${selected.concept}</p>

				<h3 style="color:#ff4d4d;">Why This Matters?</h3>
				<p>${selected.why}</p>

				<h3 style="color:#ff4d4d;">Visualization</h3>
				<pre style="
					background:#021b11;
					padding:16px;
					border:1px solid #00ff88;
					border-radius:8px;
					white-space:pre-wrap;
				">${selected.visualization}</pre>

				<h3 style="color:#ff4d4d;">Suggestion</h3>
				<p>${selected.suggestion}</p>

				<h3 style="color:#ff4d4d;">Example Fix</h3>
				<pre style="
					background:#021b11;
					padding:16px;
					border:1px solid #00ff88;
					border-radius:8px;
					white-space:pre-wrap;
				">${selected.exampleFix}</pre>
			</div>

			<script>
				const vscode = acquireVsCodeApi();

				function selectIssue(index) {
					const queue = document.getElementById('threatQueue');

					vscode.postMessage({
						command: 'selectIssue',
						index,
						queueScroll: queue ? queue.scrollTop : 0
					});
				}

				window.onload = () => {
					const queue = document.getElementById('threatQueue');

					if (queue) {
						queue.scrollTop = ${queueScroll};
					}
				};
			</script>
		</body>
		</html>
		`;
	}
}