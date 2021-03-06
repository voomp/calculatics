import { OperationTree, Operator, Scope, SyntaxBranch } from "../../@types/SyntaxTree";
import { handleError } from "../errorHandler";

const identifierScope: Scope = {
	global: {}
};

// ---- The Interpreter ----
// The last section of the Calculatics Compiler
// - Loops and interprets the Abstract SyntaxTree
// - Executes instructions and finds errors in AST
export const interpret = (syntaxTree: SyntaxBranch[]) => {

	for(const branch of syntaxTree) {
		
		switch(branch.type) {

			case 'RETURN_STATEMENT':
				log(branch);
				return;
			case 'LOG_STATEMENT':
				log(branch);
				break;
			case 'VARIABLE_STATEMENT':
				if(branch.operation)
					branch.value = parseOperationTree(branch.operation, branch.line);
				if((branch.identifier) && (branch.value))
					identifierScope.global[branch.identifier] = { value: branch.value };
				else handleError('unknown variable value', branch.line, -1);
				break;

			default:
				break;
		}

	}

}

const log = (branch: SyntaxBranch) => {
	if(branch.value) console.log(branch.value);
	else if(branch.identifier) {
		if(!identifierScope.global[branch.identifier]) handleError('invalid log identifier use', branch.line, -1);
		console.log(identifierScope.global[branch.identifier].value);
	} else if(branch.operation)
		console.log(parseOperationTree(branch.operation, branch.line));
	else handleError('unknown log value', branch.line, -1);
}

const priorityOperation = (operationTree: OperationTree, nested: boolean = false): { tree: OperationTree, items: number } => {
	let operationPriority: OperationTree = [];
	let nestOperator = true;
	let items = 0;

	for(let i = 0; i < operationTree.length; i++) {
		let operation = operationTree[i];

		if((typeof operation === 'object') && (Array.isArray(operation))) {
			operation = priorityOperation(operation).tree;
			items++;
		}

		if(['*','/'].includes(operation as Operator)) {
			if(!nested) {

				operationPriority.pop();
				const nestedOperation = priorityOperation(
					operationTree.slice(i-1), // getting rest of operation tree
					true
				);
				operationPriority.push(nestedOperation.tree);
				i+=nestedOperation.tree.length+nestedOperation.items-2;
				items++;
				continue;

			} else if((nested) && (!nestOperator)) {

				// updates nested sequence
				operationPriority.push(operation, operationTree[i+1]);
				i++;
				continue;

			}
			if(nestOperator) nestOperator = false;
		} if((['+','-'].includes(operation as Operator)) && (nested)) {
			return { tree: operationPriority, items };
		} if((operation as Operator) === '^') {
			operationPriority.pop();
			const nestedOperation = [
				operationTree[i-1],
				operationTree[i],
				operationTree[i+1]
			];
			operationPriority.push(nestedOperation);
			i++;
			items+=2;
			continue;
		}

		operationPriority.push(operation);

	}

	return { tree: operationPriority, items };
}

const evalOperation = (priorityTree: OperationTree, line: number): number => {

	if(typeof priorityTree[0] === 'string')
		return handleError('invalid number in operation tree', line, -1);
	
	let firstOperation = priorityTree[0];
	let currNum: number;
	if(typeof firstOperation === 'object') {
		if(Array.isArray(firstOperation)) currNum = evalOperation(firstOperation, line);
		else if((!Array.isArray(firstOperation)) && (identifierScope.global[firstOperation.identifier])) currNum = identifierScope.global[firstOperation.identifier].value;
		else return handleError('invalid first operation in operation tree', line, -1);
	} if(typeof firstOperation === 'number') currNum = firstOperation;
	let currOperator: Operator | null;

	for(let i = 1; i < priorityTree.length; i++) {
		let priorityNode = priorityTree[i];

		// evaluating variable identifiers
		if((typeof priorityNode === 'object') && (!Array.isArray(priorityNode))) {
			const variableObj = identifierScope.global[priorityNode.identifier];
			if(!variableObj) return handleError('invalid identifier in operation tree', line, -1);

			priorityNode = variableObj.value;
		}

		// evaluating nested trees
		else if((typeof priorityNode === 'object') && (Array.isArray(priorityNode))) {
			priorityNode = evalOperation(priorityNode, line);
		}

		// getting operator
		if(typeof priorityNode === 'string') {
			if(!currNum) return handleError('invalid operator usage in operation tree', line, -1);
			currOperator = priorityNode;
		}

		// getting nums
		if(typeof priorityNode === 'number') {
			if(!currOperator) {
				return handleError('invalid number usage in operation tree', line, -1);
			}

			switch(currOperator) {
				case '+':
					currNum += priorityNode;
					break;
				
				case '-':
					currNum -= priorityNode;
					break;
				
				case '*':
					currNum *= priorityNode;
					break;
				
				case '/':
					currNum /= priorityNode;
					break;
				
				case '^':
					currNum **= priorityNode;

				default:
					break;
			}
			currOperator = null;
		}
	}

	if(currOperator) return handleError('invalid end of operation operator', line, -1);

	return currNum;
}

export const parseOperationTree = (operationTree: OperationTree, line: number): number => {

	const priorityTree = priorityOperation(operationTree).tree;
	console.log(priorityTree);
	const evaluatedResult = evalOperation(priorityTree, line);

	return evaluatedResult;
}