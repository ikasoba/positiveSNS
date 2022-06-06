import axios from "axios"
import config from "./config.js"
import Router from "next/router"

export const endPoint =
    config.endpoints?.find(x=>globalThis?.location ? new URL(x).hostname == location?.hostname : true)
  ||config?.endpoint;

export class ErrorContentIsNull extends Error {};

export class Cache {
  /**
   * @param {any} v
   */
  constructor(v,exp=1000*60*5){
    this.value=v
    this.expiresIn=Date.now()+exp
  }
  isExpired(){
    return this.expiresIn<=Date.now()
  }
}

export default class APIClient {

  db = new class DB {
    cacheDB = new Map()
    /**
     * @param {string} k
     * @param {any} v
     */
    set(k,v){
      localStorage.setItem(k,JSON.stringify(v))
    }
    /**
     * @param {string} k
     * @returns {any|null}
     */
    get(k){
      const v = localStorage.getItem(k)
      return v!=null ? JSON.parse(v) : null
    }
    /**
     * @param {string} k
     * @param {any} v
     */
    setCache(k,v,exp=1000*60*5){
      this.cacheDB.set(k,new Cache(v,exp))
    }
    /**
     * @param {string} k
     * @param {()=>(Promise<Cache>|Cache)} resetCache
     */
    async getCache(k,resetCache){
      const cache = this.cacheDB.get(k)
      if (cache?.isExpired() || cache==null)this.cacheDB.set(k,await resetCache())
      return this.cacheDB.get(k).value
    }
  }

  /**
   * @returns {Promise<import("../../node_src/types/User").APIUser>}
   */
  async getCurrentUser(){
    return await this.db.getCache("current_user",async()=>
      new Cache((await this.getMe()) || this.db.get("current_user"))
    )
  }

  /**
   * @param {Error} e
   */
  unAuthorized(e){
    console.error(e)
    Router.push("/login")
  }

  /**
   * @param {any} e
   */
  onError(e){
    if (e?.response?.status===401){
      this.unAuthorized(e)
    }
  }

  /**
   * @returns {Promise<import("../../node_src/types/User").APIUser|null>}
   */
  async getMe(){
    const token = this.db.get("token")
    try {
      const res = await axios.get(`${endPoint}/users/me`,
        {
          headers:{
            Authorization: `Bearer ${token}`
          }
        }
      )
      return res.data
    }catch(e) {
      return null
    }
  }

  /**
   * @returns {Promise<import("../../node_src/types/User").APIUser|null>}
   */
  async deleteMe(){
    const token = this.db.get("token")
    try {
      const res = await axios.delete(`${endPoint}/users/me`,
        {
          headers:{
            Authorization: `Bearer ${token}`
          }
        }
      )
      return res.data
    }catch(e) {
      return null
    }
  }

  /**
   * @returns {Promise<import("../../node_src/types/Message").APIMessage[]|null>}
   */
  async getTimeline(){
    try {
      return (await axios.get(`${endPoint}/posts/timeline/get`)).data
    }catch(e){
      return null
    }
  }

  /**
   * @param {string} content
   * @returns {Promise<import("../../node_src/types/Message").APIMessage|null>}
   */
  async createMessage(content){
    const token = this.db.get("token")
    if (content.replace(/\r\n|\s/g,"").length==0)throw new ErrorContentIsNull("content is null");
    try {
      const res = await axios.post(`${endPoint}/posts/new`,{
        content
      },{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      return res.data
    }catch(e){
      const res = this.onError(e)
      if (res!=null)throw res;
      return null
    }
  }

  /**
   * @param {string} id
   * @returns {Promise<import("../../node_src/types/Message").APIMessage|null>}
   */
  async deleteMessage(id){
    const token = this.db.get("token")
    try {
      const res = await axios.delete(`${endPoint}/posts/${id}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })
      return res.data
    }catch(e){
      const res = this.onError(e)
      if (res!=null)throw res;
      return null
    }
  }

  /**
   * @param {string} id
   * @returns {Promise<import("../../node_src/types/Message").APIMessage|null>}
   */
  async getMessage(id){
    try {
      const res = await axios.get(`${endPoint}/posts/${id}`)
      return res.data
    }catch(e){
      return null
    }
  }

  /**
   * 
   * @param {string} value 
   * @returns {Promise<import("../../node_src/types/Message").APIMessage[]|null>}
   */
  async searchMessages(value){
    try {
      const res = await axios.get(`${endPoint}/posts/search`,{
        params:{
          q:value
        }
      })
      return res.data
    }catch(e){
      return null
    }
  }

  /**
   * @param {string} id
   * @returns {Promise<import("../../node_src/types/Message").APIMessage|null>}
   */
  async like(id){
    const token = this.db.get("token")
    try {
      return (await axios.post(`${endPoint}/posts/${id}/like`,null,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })).data
    }catch(e) {
      const res = this.onError(e)
      if (res!=null)throw res;
      return null
    }
  }

  /**
   * @param {string} id
   */
  async dislike(id){
    const token = this.db.get("token")
    try {
      return (await axios.post(`${endPoint}/posts/${id}/dislike`,null,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })).data
    }catch(e) {
      const res = this.onError(e)
      if (res!=null)throw res;
      return null
    }
  }

  /**
   * @param {string} id
   * @returns {Promise<import("../../node_src/types/Message").APIMessage|null>}
   */
  async removeLike(id){
    const token = this.db.get("token")
    try {
      return (await axios.delete(`${endPoint}/posts/${id}/like`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })).data
    }catch(e) {
      const res = this.onError(e)
      if (res!=null)throw res;
      return null
    }
  }

  /**
   * @param {string} id
   */
  async removeDislike(id){
    const token = this.db.get("token")
    try {
      return (await axios.delete(`${endPoint}/posts/${id}/dislike`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      })).data
    }catch(e) {
      const res = this.onError(e)
      if (res!=null)throw res;
      return null
    }
  }
}