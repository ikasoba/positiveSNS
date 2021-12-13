/*
* これは、OGPタグを抽出して生成するカードのキャッシュなどのためのクラスです
*/
module.exports = class CacheBase extends Map {
  /**
   * 
   * @param {*} iterable 
   * @param {number} defaultMaxAge set default cache max age, value of seconds
   */
  constructor(iterable,defMaxAge){
    super(iterable);
    this.maxAge=defMaxAge
  }
  set(name,value){
    super.set(name,{
      v:value,
      d:new Date()
    });
    return this;
  }
  get(name){
    const now=new Date();
    const data=super.get(name);
    if (now.getTime()-data.d.getTime()/1000>=this.maxAge)
  }
};