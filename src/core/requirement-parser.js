export default function parseRequirements(expression) {
  const tokens = tokenize(expression);
  let ast = parseExpression(tokens);

  if (ast.type === "method") {
    return {
      type: "expression",
      operator: "&&",
      parameters: [ ast ],
    };
  }

  return ast;
}

function tokenize(expression) {
  const regex =
    /\s*([()])\s*|\s*(\|\||&&|\|)\s*|\s*((?:[^()&|]+\([^()]+\))|[^()&|]+)\s*/g;
  const tokens = [];
  let match;

  while ((match = regex.exec(expression)) !== null) {
    const [ , parenthesis, operator, token ] = match;

    if (parenthesis !== undefined) {
      tokens.push({ type: "parenthesis", value: parenthesis });
    } else if (operator !== undefined) {
      tokens.push({
        type: "operator",
        // We do the below to make operators backwards-compatible with previous
        // versions of Async Alpine, where '|' is equivalent to &&
        value: operator === "|" ? "&&" : operator,
      });
    } else {
      const tokenObj = {
        type: "method",
        method: token.trim(),
      };

      if (token.includes("(")) {
        tokenObj.method = token.substring(0, token.indexOf("(")).trim();
        tokenObj.argument = token.substring(
          token.indexOf("(") + 1,
          token.indexOf(")")
        );
      }

      // to deal with backwards compatibility of immediate === eager
      if (token.method === "immediate") {
        token.method = "eager";
      }

      tokens.push(tokenObj);
    }
  }

  return tokens;
}

function parseExpression(tokens) {
  let ast = parseTerm(tokens);

  while (
    tokens.length > 0 &&
    (tokens[0].value === "&&" ||
      tokens[0].value === "|" ||
      tokens[0].value === "||")
  ) {
    const operator = tokens.shift().value;
    const right = parseTerm(tokens);

    if (ast.type === "expression" && ast.operator === operator) {
      ast.parameters.push(right);
    } else {
      ast = {
        type: "expression",
        operator: operator,
        parameters: [ ast, right ],
      };
    }
  }

  return ast;
}

function parseTerm(tokens) {
  if (tokens[0].value === "(") {
    tokens.shift();
    const ast = parseExpression(tokens);

    if (tokens[0].value === ")") {
      tokens.shift();
    }

    return ast;
  } else {
    return tokens.shift();
  }
}
