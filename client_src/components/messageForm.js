import Button from "./button.js"
import { useRef,useState,useEffect } from "react"
import Router from 'next/router'
import Twemoji from "react-twemoji"
import APIClient, { ErrorContentIsNull } from "../API/client.js"

/** @type {import("react")} */
let React;

const client = new APIClient()

/**
 * @type {React.FC}
 * @param {{onPost:(msg:import("../../node_src/types/Message.js").APIMessage)=>void}} props
 */
export default function MessageForm({onPost}){
  /**
   * @type {[
   *  null|import("../../node_src/types/User").APIUser,import("react").Dispatch<import("react").SetStateAction<null|import("../../node_src/types/User").APIUser>>
   * ]}
   */
  const [user,setUser] = /** @type {any} */(useState(null))
  /**
   * @type {import("react").MutableRefObject<null|HTMLDivElement>}
   */
  const content = useRef(null)

  useEffect(()=>{
    (async()=>{
      if (client.db.get("token")==null)return;
      try {
        setUser(await client.getCurrentUser())
      }catch{}
    })()
  },[])

  return (
    <div className="border-b-2 border-gray-200 p-2 flex-col">
        <div
          className="w-full resize-none rounded-xl bg-slate-200 p-2 h-auto overflow-auto max-h-64 mb-2 outline-none"
          contentEditable
          ref={content}
        />
      <div className="flex justify-between">
        <div>
          <Twemoji tag='span'>
            {user?.usertag ? user?.username + "@" + user?.usertag : ""}
          </Twemoji>
        </div>
        <Button onClick={async()=>{
          try {
            if (content.current==null)return;
            const res = await client.createMessage(content?.current?.innerText || "")
            content.current.innerText = ""
            if (onPost && res)onPost(res)
          }catch(e) {
            if (e instanceof ErrorContentIsNull)return;
          }
        }}>
          submit
        </Button>
      </div>
    </div>
  )
}