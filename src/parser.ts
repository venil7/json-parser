import { Token, TokenType } from "./tokenizer";
export enum AstType {
  Object = "object",
  Array = "array",
  String = "string",
  Number = "number",
  Boolean = "boolean",
  KeyValue = "key_value"
}

export type AstNumber = { type: typeof AstType.Number; value: number };
export type AstString = { type: typeof AstType.String; value: string };
export type AstBoolean = { type: typeof AstType.Boolean; value: boolean };
export type AstArray = { type: typeof AstType.Array; value: Ast[] };
export type AstKeyValue = {
  type: typeof AstType.KeyValue;
  value: { key: AstString; value: Ast };
};
export type AstObject = { type: typeof AstType.Object; value: AstKeyValue[] };
export type Ast =
  | AstObject
  | AstArray
  | AstString
  | AstBoolean
  | AstNumber
  | AstKeyValue;

type ParseResult = [Ast, Token[]];

const expectPunc = (c: string) => (tokens: Token[]): Token[] => {
  const [first, ...remainder] = tokens;
  if (!first) throw Error(`unexpected end of input`);
  if (first.type === TokenType.Punc && first.value === c) return remainder;
  throw Error(`${c} expected around ${first.value}`);
};
const expectOpenArray = expectPunc("[");
const expectCloseArray = expectPunc("]");
const expectOpenObj = expectPunc("{");
const expectCloseObj = expectPunc("}");
const expectComa = expectPunc(",");
const expectColumn = expectPunc(":");

const parseNumber = (tokens: Token[]): ParseResult => {
  const [first, ...remainder] = tokens;
  if (first.type === TokenType.Number)
    return [{ type: AstType.Number, value: first.value }, remainder];
  throw Error(`${first.value} not a number`);
};
const parseString = (tokens: Token[]): ParseResult => {
  const [first, ...remainder] = tokens;
  if (first.type === TokenType.String)
    return [{ type: AstType.String, value: first.value }, remainder];
  throw Error(`${first.value} not a string`);
};
const parseBoolean = (tokens: Token[]): ParseResult => {
  const [first, ...remainder] = tokens;
  if (
    first.type === TokenType.Name &&
    (first.value === "true" || first.value === "false")
  )
    return [
      { type: AstType.Boolean, value: first.value === "true" },
      remainder
    ];
  throw Error(`unexpected token ${first.value}`);
};

const parseKeyValue = (tokens: Token[]): ParseResult => {
  const [key, rem1] = parseString(tokens);
  const rem2 = expectColumn(rem1);
  const [value, remainder] = parseItem(rem2);
  return [
    { type: AstType.KeyValue, value: { key: key as AstString, value } },
    remainder
  ];
};

const parseBrackets = (
  startBracket: string,
  stopBracket: string,
  parseFunc = parseItem
) => (tokens: Token[]): [Ast[], Token[]] => {
  let _tokens = expectPunc(startBracket)(tokens);
  const items: Ast[] = [];
  while (_tokens.length > 0) {
    const [maybeClosingBracket] = _tokens;
    if (
      maybeClosingBracket.type === TokenType.Punc &&
      maybeClosingBracket.value === stopBracket
    ) {
      let remainder = expectPunc(stopBracket)(_tokens);
      return [items, remainder];
    }
    const [item, remainder] = parseFunc(_tokens);
    items.push(item);
    const [maybeClosingBracket2] = remainder;

    if (
      maybeClosingBracket2.type === TokenType.Punc &&
      maybeClosingBracket2.value === stopBracket
    ) {
      let remainder2 = expectPunc(stopBracket)(remainder);
      return [items, remainder2];
    }
    const rem2 = expectComa(remainder);
    _tokens = rem2;
  }
  let remainder = expectPunc(stopBracket)(_tokens);
  return [items, remainder];
};

const parseArray = (tokens: Token[]): ParseResult => {
  const [value, remainder] = parseBrackets("[", "]", parseItem)(tokens);
  return [{ type: AstType.Array, value }, remainder];
};
const parseObject = (tokens: Token[]): ParseResult => {
  const [keyValuePairs, remainder] = parseBrackets("{", "}", parseKeyValue)(
    tokens
  );
  return [
    { type: AstType.Object, value: keyValuePairs as AstKeyValue[] },
    remainder
  ];
};

export const parseItem = (tokens: Token[]): ParseResult => {
  const [token] = tokens;
  switch (token.type) {
    case TokenType.Name:
      return parseBoolean(tokens);
    case TokenType.String:
      return parseString(tokens);
    case TokenType.Number:
      return parseNumber(tokens);
    case TokenType.Punc: {
      switch (token.value) {
        case "[":
          return parseArray(tokens);
        case "{":
          return parseObject(tokens);
      }
    }
    default:
      throw Error(`unexpected token ${token.value}`);
  }
};
