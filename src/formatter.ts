import {
  AstString,
  AstNumber,
  AstBoolean,
  AstKeyValue,
  AstArray,
  AstObject,
  Ast,
  AstType
} from "./parser";
const IND = 2;
const indentation = (i: number = 0) =>
  Array.from(Array(i))
    .map(_ => " ")
    .join("");
const formatString = (s: AstString, i = 0): string =>
  `${indentation(i)}"${s.value}"`;
const formatNumber = (s: AstNumber, i = 0): string =>
  `${indentation(i)}${s.value}`;
const formatBoolean = (s: AstBoolean, i = 0): string =>
  `${indentation(i)}${s.value}`;
const formatKeyValue = (s: AstKeyValue, i = 0): string =>
  `${formatString(s.value.key, i)}: ${formatValue(s.value.value, i)}`;
const formatArray = (s: AstArray, i = 0): string =>
  `${indentation(i)}[\n${s.value
    .map(v => format(v, i + IND))
    .join(",\n")}\n${indentation(i)}]`;
const formatObject = (s: AstObject, i = 0): string =>
  `${indentation(i)}{\n${s.value
    .map(v => formatKeyValue(v, i + IND))
    .join(",\n")}\n${indentation(i)}}`;

const formatValue = (s: Ast, i: number = 0): string => format(s, i).trimStart();

export const format = (s: Ast, i: number = 0): string => {
  switch (s.type) {
    case AstType.String:
      return formatString(s, i);
    case AstType.Number:
      return formatNumber(s, i);
    case AstType.Boolean:
      return formatBoolean(s, i);
    case AstType.Array:
      return formatArray(s, i);
    case AstType.Object:
      return formatObject(s, i);
  }
  throw Error("cant format");
};
