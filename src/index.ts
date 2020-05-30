import { tokenize } from "./tokenizer";
import { parseItem } from "./parser";
import { format } from "./formatter";

const json = `{"menu": {  "id": "file",
  "value": "File",
  "popup": {
    "menuitem": [      {"value": "New", "onclick": "CreateNewDoc()"},
      {"value": "Open", "onclick": "OpenDoc()"},
      {"value": "Close", "onclick": "CloseDoc()"}
    ]
  }
}}`;
const tokens = tokenize(json);

let result = "";
try {
  const [ast] = parseItem(tokens);
  result = format(ast);
  // result = JSON.stringify(ast, null, 2);
} catch (e) {
  result = `parser error: "${e.message}"`;
}

document.getElementById("app").innerHTML = result;
// document.getElementById("app").innerHTML = JSON.stringify(tokens,null, 2);
