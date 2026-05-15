import { Issue } from '../models/Issue';

import { detectOffByOne } from './offByOne';
import { detectAssignmentInCondition } from './assignmentInCondition';
import { detectEmptyLoop } from './emptyLoop';
import { detectUnreachableCode } from './unreachableCode';
import { detectInfiniteRecursion } from './infiniteRecursion';
import { detectWrongLoopUpdate } from './wrongLoopUpdate';
import { detectNullAccess } from './nullAccess';
import { detectMutatingArray } from './mutatingArray';
import { detectDuplicateCondition } from './duplicateCondition';
import { detectInfiniteLoop } from './infiniteLoop';
import { detectMissingRecursionBase } from './missingRecursionBase';
import { detectMissingHashInit } from './missingHashInit';
import { detectDivisionByZero } from './divisionByZero';
import { detectModuloByZero } from './moduloByZero';
import { detectFloatingPointEquality } from './floatingPointEquality';
import { detectMissingReturn } from './missingReturn';
import { detectEmptyCollectionAccess } from './emptyCollectionAccess';
import { detectUnsafePop } from './unsafePop';
import { detectBinarySearchBoundary } from './binarySearchBoundary';
import { detectBinarySearchInfinite } from './binarySearchInfinite';

export function runDetectors(path: any): Issue[] {
	const issues: Issue[] = [];
	const nodeType = path.node.type;

	switch (nodeType) {
		case 'ForStatement': {
			const offByOne = detectOffByOne(path);
			if (offByOne) issues.push(offByOne);

			const wrongLoop = detectWrongLoopUpdate(path);
			if (wrongLoop) issues.push(wrongLoop);

			const emptyLoop = detectEmptyLoop(path);
			if (emptyLoop) issues.push(emptyLoop);

			break;
		}

		case 'IfStatement': {
			const assignment = detectAssignmentInCondition(path);
			if (assignment) issues.push(assignment);

			const duplicate = detectDuplicateCondition(path);
			if (duplicate) issues.push(duplicate);

			break;
		}

		case 'CallExpression': {
			const recursion = detectInfiniteRecursion(path);
			if (recursion) issues.push(recursion);

			const mutation = detectMutatingArray(path);
			if (mutation) issues.push(mutation);

			const hashInit = detectMissingHashInit(path);
			if (hashInit) issues.push(hashInit);

			const unsafePop = detectUnsafePop(path);
			if (unsafePop) issues.push(unsafePop);

			break;
		}

		case 'MemberExpression': {
			const nullIssue = detectNullAccess(path);
			if (nullIssue) issues.push(nullIssue);

			const emptyAccess = detectEmptyCollectionAccess(path);
			if (emptyAccess) issues.push(emptyAccess);

			break;
		}

		case 'ReturnStatement': {
			const unreachable = detectUnreachableCode(path);
			if (unreachable) issues.push(unreachable);

			break;
		}

case 'WhileStatement': {
	const offByOne = detectOffByOne(path);
	if (offByOne) issues.push(offByOne);

	const infiniteLoop = detectInfiniteLoop(path);
	if (infiniteLoop) issues.push(infiniteLoop);

	const binaryInfinite = detectBinarySearchInfinite(path);
	if (binaryInfinite) issues.push(binaryInfinite);

	break;
}

		case 'FunctionDeclaration': {
	const hasRecursiveCall = path
		.toString()
		.includes(`${path.node.id?.name}(`);

	const missingBase = detectMissingRecursionBase(path);

	// suppress weaker recursion warning if stronger recursion detector will fire
	if (missingBase && !hasRecursiveCall) {
		issues.push(missingBase);
	}

	const missingReturn = detectMissingReturn(path);
	if (missingReturn) {
		issues.push(missingReturn);
	}

	break;
}

		case 'BinaryExpression': {
			const division = detectDivisionByZero(path);
			if (division) issues.push(division);

			const modulo = detectModuloByZero(path);
			if (modulo) issues.push(modulo);

			const floatEq = detectFloatingPointEquality(path);
			if (floatEq) issues.push(floatEq);

			const binaryBoundary = detectBinarySearchBoundary(path);
			if (binaryBoundary) issues.push(binaryBoundary);

			break;
		}
	}

	return issues;
}