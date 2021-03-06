/*MIT License
Copyright 2022 ikasoba

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

End license text.
*/

/**
 * source: https://gist.github.com/ikasoba/2d90bbab319a8cd59c1f24582cc3671e
 * @desc 豁｣隕剰｡ｨ迴ｾ繧ｪ繝悶ず繧ｧ繧ｯ繝医・縺昴・縺ｾ縺ｾ蝓九ａ霎ｼ縺ｾ繧後√◎繧御ｻ･螟悶・繧ｨ繧ｹ繧ｱ繝ｼ繝励＆繧後∪縺吶・ * @return {RegExp} 邨・∩遶九※縺滓ｭ｣隕剰｡ｨ迴ｾ
 * @example
 * let binOps = /[+\-*\/]/
 * console.log(r`\\d${binOps}\\d``g`) // /\d(?:[+\-*\/])\d/g
 */
export const r = (reg:string[],...exts:any[])=>{
  let r:string[]=[];
  return reg.forEach((v:string,i:number)=>
    r.push(v) && (i%2==0) && (Math.floor(i/2)<exts.length) && (
      r.push("(?:"+(
          exts[Math.floor(i/2)] instanceof RegExp
          ? exts[Math.floor(i/2)].source
          : exts[Math.floor(i/2)].toString().replace(/[.*+?^=!:${}()|[\]/\\]/g,'\\$&')
      )+")")
    )
  ) || ((flgs)=>new RegExp(r.join(""),flgs))
}
