import { useEffect, useState } from 'react'
import APIClient from '../API/client'
import Message from '../components/message'
import Screen from '../components/Screen'
import SearchBar from '../components/SearchBar'
import TimeLine from '../components/TimeLine'

const client = new APIClient()

export default function Search(){
  const params = new URLSearchParams(globalThis?.document!==undefined ? document.location.search : "")
  const search = params.get("q")
  /**
   * @type {[import("../../node_src/types/Message").APIMessage[],import('react').Dispatch<import('react').SetStateAction<import("../../node_src/types/Message").APIMessage[]>>]}
   */
  const [res,setRes] = /** @type {any} */(useState([]))
  useEffect(()=>{(async()=>{
    if (search==null)return;
    setRes(await client.searchMessages(search) || [])
  })()},[search])
  console.log(res)
  return (
    <Screen>
      <div className='lg:hidden p-2'>
        <SearchBar/>
      </div>
      {res.filter(x=>Object.values(x).every(x=>x!=null)).map((x,i)=><Message {...x} key={i} />)}
    </Screen>
  )
}
