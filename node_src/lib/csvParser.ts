import Lexer from "./lexer.js";

const lex = new Lexer()
let str = false

lex.add(/^"((?:[^\r\n"\\]|\\.)*)"/,(m)=>{
  if (str==true)throw new Error(`invalid syntax`);
  str=true;
  return m[1];
})

lex.add(/^[^\r\n,"]+/,(m)=>{
  if (str==true)throw new Error(`invalid syntax`);
  str=true;
  return m[0];
})

lex.add(/^(,,)|,/,(m)=>{
  str=false;
  return m[1] ? "" : null;
})

export const parseCSV = (src:string):string[][] => src.split(/[\r\n]|\r\n/g).map((l)=>{
  str=false;
  return lex.eval(l);
})