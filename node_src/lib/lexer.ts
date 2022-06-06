export type Parser = (m:RegExpMatchArray)=>any
export class NoInclement {}

export interface ParserValue {
  p:Parser
}

export class Lexer {
  private parsers = new Map<RegExp,ParserValue>()

  add(pattern:string|RegExp,parser:Parser){
    this.parsers.set(
      typeof pattern === "string" ? new RegExp("^"+pattern.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&'),"g") : pattern,
      {
        p:parser
      } as ParserValue
    )
    return this
  }

  eval(src:string):any[] {
    const res = [];
    const patterns = new Map<RegExp,boolean>();
    for (let i=0;i<src.length;){
      let match;
      for (const [p,pv] of this.parsers.entries()){
        const {p:parserFunc} = pv;
        const isNotMatchable = patterns.get(p);
        if (isNotMatchable){
          patterns.set(p,false)
          continue;
        }
        match={
          m:src.slice(i).match(p),
          p:p,
          f:parserFunc,
          pv:pv
        }
        if (match.m){
          break
        }
      }
      if (match?.m==null)throw new Error(`invalid char: ${src.slice(i)[0]}`);
      const parsed = match.f(match.m);
      if (!(parsed instanceof NoInclement))i+=match.m[0].length || 1;
      else {
        patterns.set(match.p,true)
        continue;
      }
      if (parsed)res.push(parsed);
    }
    return res
  }
}

export default Lexer