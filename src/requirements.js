import strategies from './strategies.js'

/**
 * Split the strategy into unique requirements and resolve the function when they're met
 */
export async function awaitRequirements(component) {
	const requirements = parseRequirements(component.strategy)
	await generateRequirements(component, requirements)
}

/**
 * Converts an AST-like map produced by parseRequirements and convert to Promise all/any (and/or)
 */
async function generateRequirements(component, requirements) {
	if (requirements.type === 'expression') {
		if (requirements.operator === '&&') {
			return Promise.all(
				requirements.parameters
					.map(param => generateRequirements(component, param)),
			)
		}

		if (requirements.operator === '||') {
			return Promise.any(
				requirements.parameters
					.map(param => generateRequirements(component, param)),
			)
		}
	}

	if (!strategies[requirements.method]) return false

	return strategies[requirements.method]({
		component,
		argument: requirements.argument,
	})
}

/**
 *
 * =================================
 * The functions below together take a requirements expression with somewhat JS-like syntax
 * and convert into a structured tree with AND and OR conditions we can process.
 * =================================
 */
function parseRequirements(expression) {
	const tokens = tokenize(expression)
	let ast = parseExpression(tokens)

	// instead of handling the instance with one item separately we just consider it an AND with only 1 param
	if (ast.type === 'method') {
		return {
			type: 'expression',
			operator: '&&',
			parameters: [ast],
		}
	}

	return ast
}

function tokenize(expression) {
	// this was generated based on a comprehensive list of test strings
	// it seems to work perfectly, hopefully no changes are required!
	const regex
		= /\s*([()])\s*|\s*(\|\||&&|\|)\s*|\s*((?:[^()&|]+\([^()]+\))|[^()&|]+)\s*/g
	const tokens = []
	let match

	while ((match = regex.exec(expression)) !== null) {
		const [_, parenthesis, operator, token] = match

		if (parenthesis !== undefined) {
			tokens.push({ type: 'parenthesis', value: parenthesis })
		}
		else if (operator !== undefined) {
			tokens.push({
				type: 'operator',
				// we do the below to make operators backwards-compatible with previous
				// versions of Async Alpine, where '|' is equivalent to &&
				value: operator === '|' ? '&&' : operator,
			})
		}
		else {
			const tokenObj = {
				type: 'method',
				method: token.trim(),
			}

			if (token.includes('(')) {
				tokenObj.method = token.substring(0, token.indexOf('(')).trim()
				tokenObj.argument = token.substring(
					token.indexOf('(') + 1,
					token.indexOf(')'),
				)
			}

			// to deal with backwards compatibility of immediate === eager
			if (token.method === 'immediate') {
				token.method = 'eager'
			}

			tokens.push(tokenObj)
		}
	}

	return tokens
}

function parseExpression(tokens) {
	let ast = parseTerm(tokens)

	while (
		tokens.length > 0
		&& (tokens[0].value === '&&'
		|| tokens[0].value === '|'
		|| tokens[0].value === '||')
	) {
		const operator = tokens.shift().value
		const right = parseTerm(tokens)

		if (ast.type === 'expression' && ast.operator === operator) {
			ast.parameters.push(right)
		}
		else {
			ast = {
				type: 'expression',
				operator: operator,
				parameters: [ast, right],
			}
		}
	}

	return ast
}

function parseTerm(tokens) {
	if (tokens[0].value === '(') {
		tokens.shift()
		const ast = parseExpression(tokens)

		if (tokens[0].value === ')') {
			tokens.shift()
		}

		return ast
	}
	else {
		return tokens.shift()
	}
}
