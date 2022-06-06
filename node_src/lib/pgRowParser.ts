import {parseCSV} from "./csvParser.js";

//source: https://qiita.com/suin/items/9bc35bcebab6a57a3f4d
type Tail<T extends unknown[]> = T extends [any, ...infer Rest] ? Rest : []

export type Parser<T> = (c:string)=>T;
export type Parsers<T extends any[],A extends Parser<any>[] = []> = {
  1:Parsers<Tail<T>,[...A,Parser<T[0]>]>,
  0:A
}[T["length"] extends 0 ? 0 : 1];

export function pgRowParser<T extends any[]>(rawRow:string,parsers:Parsers<T>):T {
  const row = parseCSV(rawRow)[0];
  console.log(row);
  return row.map((x:any,i:number)=>(parsers as Parser<any>[])[i](x)) as T
}