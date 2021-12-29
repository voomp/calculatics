import { Token, TokenType } from '../../@types/Token';

export const lex = (charSequence: string[]) => {

	const tokens: Token[] = [];
	let currToken = '';
	let pos = 0;
	let numToken = '';

	for(const char of charSequence) {
		currToken += char;

		if((Number(currToken) === NaN) && (numToken !== '')) {
			tokens.push({
				type: TokenType.Number,
				text: numToken,
				pos: pos-numToken.length
			});
			numToken = '';
		}

		if(currToken === 'ret') {
			tokens.push({
				type: TokenType.Statement,
				text: currToken,
				pos
			});
			currToken = '';
		}

		if(currToken === '->') {
			tokens.push({
				type: TokenType.Pointer,
				text: currToken,
				pos
			});
			currToken = '';
		}

		if((!isNaN(+currToken)) && (currToken !== '')) {
			numToken += currToken;
			currToken = '';
		}

		if((pos+1 === charSequence.length) && (numToken !== '')) {
			tokens.push({
				type: TokenType.Number,
				text: numToken,
				pos: pos-numToken.length
			});
		}

		pos++;
	}

	return tokens;

}