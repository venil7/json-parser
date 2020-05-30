export enum TokenType {
  Punc = "punc",
  String = "string",
  Name = "name",
  Number = "number"
}

export type Token =
  | { type: typeof TokenType.Punc; value: string }
  | { type: typeof TokenType.String; value: string }
  | { type: typeof TokenType.Number; value: number }
  | { type: typeof TokenType.Name; value: string };

type TokenResult = [Token, string];

const PUNCS = ":{}[],".split("");
const NUMS = "1234567890".split("");
const SPACE = [" ", "\t", "\n"];
const ALPHA = "abcdefghijklmnopqrstuvwxyz_".split("");
const ALPHANUM = [...ALPHA, ...NUMS];
const QUOTE = `"`.split("");

export const tokenize = (s: string): Token[] => {
  if (!s.length) return [];
  let c = s[0];
  if (isSpace(c)) {
    const [, remainder] = takeWhileSpace(s);
    return tokenize(remainder);
  }
  if (isNum(c)) {
    const [token, remainder] = asNum(s);
    return [token, ...tokenize(remainder)];
  }
  if (isPunc(c)) {
    const [token, remainder] = asPunc(s);
    return [token, ...tokenize(remainder)];
  }
  if (isAlpha(c)) {
    const [token, remainder] = asAlpha(s);
    return [token, ...tokenize(remainder)];
  }
  if (isQuote(c)) {
    const [token, remainder] = asString(s);
    return [token, ...tokenize(remainder)];
  }
  return tokenize(s.substring(1));
};

const is = (chars: string[]) => (cc: string): boolean =>
  chars.findIndex(c => c === cc) > -1;
const isAlpha = is(ALPHA);
const isNum = is(NUMS);
const isPunc = is(PUNCS);
const isSpace = is(SPACE);
const isQuote = is(QUOTE);

const takeWhile = (chars: string[]) => (s: string): [string, string] => {
  let result = "";
  while (s.length > 0 && chars.findIndex(c => c === s[0]) > -1) {
    result += s[0];
    s = s.substring(1);
  }
  return [result, s /*remainder*/];
};

const takeUntil = (chars: string[]) => (
  s: string,
  incl = true
): [string, string] => {
  let result = "";
  while (s.length > 0 && chars.findIndex(c => c === s[0]) === -1) {
    result += s[0];
    s = s.substring(1);
  }
  if (incl) {
    // result += s[0];
    s = s.substring(1);
  }
  return [result, s /*remainder*/];
};

const takeUntilStringEnds = takeUntil(QUOTE);
const takeWhilePunc = takeWhile(PUNCS);
const takeWhileNums = takeWhile(NUMS);
const takeWhileSpace = takeWhile(SPACE);
const takeWhileAlpaNum = takeWhile(ALPHANUM);

const asPunc = (s: string): TokenResult => {
  return [{ type: TokenType.Punc, value: s[0] }, s.substring(1)];
};

const asNum = (s: string): TokenResult => {
  const regex = () => /^\d+(\.\d+)?/;
  const value = (s.match(regex()) as string[])[0];
  const remainder = s.replace(regex(), "");
  const token: Token = { type: TokenType.Number, value: parseFloat(value) };
  return [token, remainder];
};

const asAlpha = (s: string): TokenResult => {
  const [value, remainder] = takeWhileAlpaNum(s);
  const token: Token = { type: TokenType.Name, value };
  return [token, remainder];
};

const asString = (s: string): TokenResult => {
  const [value, remainder] = takeUntilStringEnds(s.substring(1));
  const token: Token = { type: TokenType.String, value };
  return [token, remainder];
};
