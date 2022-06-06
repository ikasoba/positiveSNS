

export interface Cache<V> {
  v:V
  d:Date
}

/*
* これは、OGPタグを抽出して生成するカードのキャッシュなどのためのクラスです
*/
export default class CacheBase<K,V> {

  /**
   * 
   * @param {*} entries 
   * @param {number} defaultMaxAge set default cache max age, value of seconds
   */
  constructor(
    public maxAge=60*60*24*7*3,
    private cache = new Map<K,Cache<V>>()
  ){
  }
  set(name:K,value:V){
    this.cache.set(name,<Cache<V>>{
      v:value,
      d:new Date()
    });
    return this;
  }
  get(name:K): Cache<V> {
    const now=new Date();
    const data=this.cache.get(name);
    if (data==undefined){
      throw new Error(`key ${name} is undefined`);
    }
    if (now.getTime()-data.d.getTime()/1000>=this.maxAge){
      this.cache.delete(name)
      return data;
    }
    return data
  }
};