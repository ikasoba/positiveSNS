import Message from "./message";
import { useState,useEffect } from "react"
import MessageForm from "./messageForm";
import APIClient from "../API/client";
import Link from "next/link"

/** @type {import("react")} */
let React;

const client = new APIClient()

export default function TimeLine(){
  /**
   * @type {[import("../../node_src/types/Message").APIMessage[],import("react").Dispatch<import("react").SetStateAction<import("../../node_src/types/Message").APIMessage[]>>]}
   */
  const [messages,setMessages] = /**@type {any}  */(useState(null))

  /**
   * @param {import("../../node_src/types/Message").APIMessage} msg
   */
  function postHandler(msg){
    if (typeof msg !== "object")return;
    setMessages([
      msg,
      ...messages
    ])
  }

  useEffect(()=>{
    (async()=>{
      const timeline = await client.getTimeline()
      if (timeline==null)return;
      setMessages(timeline)
    })()
  },[])

  return (
    <div>
      <MessageForm onPost={postHandler} />
      <div className="overflow-x-auto">
        {messages?.map((msg,i)=> /** @type {any} */(console.log("msg:",msg)) ||
          <Message
            key={i}
            created_at={new Date(msg.created_at)}
            author={/** @type {import("../../node_src/types/User").APIUser} */(msg.author)}
            content={msg.content}
            id={msg.id}
            user_id={msg.user_id}
            like={msg.like}
            dislike={msg.dislike}
            disliked_users={msg.disliked_users}
            liked_users={msg.liked_users}
            onDelete={()=>setMessages(messages.filter((_,j)=>i!=j))}
            link={true}
          />
        )}
      </div>
    </div>
  )
}