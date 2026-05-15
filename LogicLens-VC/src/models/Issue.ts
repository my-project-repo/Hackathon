export interface Issue {
	id: string;
	title: string;
	concept: string;
	why: string;
	visualization: string;
	suggestion: string;
	exampleFix: string;
	line: number;
	severity: 'critical' | 'high' | 'medium' | 'low';
}