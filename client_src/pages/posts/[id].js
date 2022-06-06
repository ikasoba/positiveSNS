import { useRouter } from "next/router";
import {useEffect, useState} from "react"
import APIClient from "../../API/client";
import Screen from "../../components/Screen";
import Message from "../../components/message";

export default function Post(){
  const router = useRouter()
  const [id,setId] = useState(/** @type {string|null} */(null))
  const client = new APIClient()
  const [message,setMessage] = useState(/** @type {null|import("../../../node_src/types/Message").APIMessage} */(null))

  useEffect(()=>{
    if (router.asPath!==router.route){
      setId(/** @type {string} */(router.query.id))
    }
  },[router])
  
  useEffect(() => {(async()=>{
    if (id==null)return;
    setMessage(await client.getMessage(id))
  })()}, [id])

  console.log("msg",message)

  return (
    <Screen>
      {message==null ?
        <Message
          author={{
            username:"unknown user",
            usertag:"positiveSNS"
          }}
          content={``}
          created_at={new Date()}
          dislike={0}
          like={0}
          disliked_users={[]}
          liked_users={[]}
          id=""
          user_id=""
          onDelete={()=>router.push("/")}
        />
      :
        <Message {...message} onDelete={()=>router.push("/")} />
      }
    </Screen>
  )
}