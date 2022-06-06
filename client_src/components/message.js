import { useTranslation } from 'react-i18next';
import Twemoji from 'react-twemoji';
import { TiHeartOutline,TiHeart,TiThumbsDown, TiThMenu, TiTrash } from "react-icons/ti";
import {IconButton,IconRadioButton} from './iconButton';
import APIClient from '../API/client';
import { useEffect, useState } from 'react';
import UI from './UI';
import Link from "next/link"
import { useRouter } from 'next/router';

/**
 * @type {import("react")}
 */
let React;

const client = new APIClient()

/**
 * @param {Date} date
 * @param {import('i18next').TFunction} t
 */
export const toUnitNotation = (date,t) => {
  if (date==null)return "";
  const epoch = Date.now() - date?.getTime()
  console.log(epoch)
  return (
      epoch < 60*1000 && epoch >= 0
    ? `${Math.floor(epoch/1000)}${t("time.sec")}`
    : epoch < 60*60*1000 && epoch >= 60*1000
    ? `${Math.floor(epoch/1000/60)}${t("time.min")}`
    : epoch < 24*60*60*1000 && epoch >= 60*60*1000
    ? `${Math.floor(epoch/1000/60/60)}${t("time.hour")}`
    : epoch >= 24*60*60*1000
    ? `${1+date.getMonth()}${t("time.month")}${1+date.getDate()}${t("time.day")}`
    : ""
  )
}

/**
 * @param {string} content
 */
export function parseContent(content){
  return content
    .split(/\r\n|\r|\n/)
    .map((ln,i)=>[
      <Twemoji key={i} tag="p">{ln}</Twemoji>
    ])
    .flat(1)
}

/**
 * @typedef {{
 *  author?:{
 *    username:string
 *    usertag:string
 *  }|null
 *  content:string
 *  id:string
 *  like:number
 *  dislike:number
 *  liked_users:string[]
 *  disliked_users:string[]
 *  created_at:string|Date
 *  user_id:string
 *  onDelete?:()=>void
 *  link?:boolean
 * }} MessageProps
 */
/**
 * @type {React.FC}
 * @param {MessageProps} props
 */
export default function Message(props){
  /** @type {[any,import('react').Dispatch<import('react').SetStateAction<any>>]} */
  const [data,setData] = useState(null)
  /** @type {[boolean,import('react').Dispatch<import('react').SetStateAction<boolean>>]} */
  const [isCurrentUser,setIsCurrentUser] = /** @type {any} */(useState(false))
  /** @type {typeof props} */
  const {author,content,id,user_id,like,dislike,liked_users,disliked_users} = data || props;
  const {onDelete,link} = props
  const username = author?.username,
        usertag = author?.usertag;
  let {created_at} = data || props;
  if (typeof created_at == "string")created_at=new Date(created_at);
  
  const router = useRouter()

  const {t} = useTranslation()

  /** @type {[any,import('react').Dispatch<import('react').SetStateAction<any>>]} */
  const radioState = useState(null)

  useEffect(()=>{(async()=>{
    const currentUser = await client.getCurrentUser()
    if (currentUser==null)return;
    setIsCurrentUser(currentUser.id===user_id)
    radioState[1](
      currentUser.id && liked_users?.includes(currentUser.id) ? "like"
      : currentUser.id && disliked_users?.includes(currentUser.id) ? "dislike"
      : null
    )
  })()},[user_id])

  return (
    <div className="flex flex-col border-b-2 border-gray-200 p-2">
      <div
        className={"flex flex-col " + (link ? "cursor-pointer" : "")}
        onClick={link ? ()=>router.push("/posts/"+id) : undefined}
      >
        <div className="flex justify-between">
          <Twemoji tag='span'>
            {username && usertag
              ? username + "@" + usertag
              : <>
                  deleted user
                </>}
          </Twemoji>
          <span>
            {toUnitNotation(created_at,t)}
          </span>
        </div>
        <div>
          {parseContent(content)}
        </div>
      </div>
      <div
        className="flex flex-row justify-evenly select-none"
      >
        <div className='flex flex-row items-center'>
          <span>{like ? like : ""}</span>
          <IconRadioButton
            state={radioState}
            type="like"
            value={"like"}
            onChange={async(c)=>{
              if (c && id){
                const res = await client.like(id)
                if (res==null)return;
                res.created_at = new Date(res.created_at)
                setData(res)
              }else if (!c && id){
                const res = await client.removeLike(id)
                if (res==null)return;
                res.created_at = new Date(res.created_at)
                setData(res)
              }
            }}
          />
        </div>
        <div className='flex flex-row items-center'>
          <span>{dislike ? dislike : ""}</span>
          <IconRadioButton
            state={radioState}
            type="dislike"
            value={"dislike"}
            onChange={async(c)=>{
              if (c && id){
                const res = await client.dislike(id)
                if (res==null)return;
                res.created_at = new Date(res.created_at)
                if (res)setData(res)
              }else if (!c && id){
                const res = await client.removeDislike(id)
                if (res==null)return;
                res.created_at = new Date(res.created_at)
                if (res)setData(res)
              }
            }}
          />
        </div>
        <div className='flex flex-row items-center'>
          <UI.Menu
            btnContent={<TiThMenu size="1.5rem" />}
          >
            { isCurrentUser &&
              <UI.Menu.Item onClick={()=>{client.deleteMessage(id);void(onDelete && onDelete());}} >
                <TiTrash size="1.5rem"/>delete
              </UI.Menu.Item> }
            { /** @type {any} */(process).browser && location?.protocol === "https:" &&
              <UI.Menu.Item
                onClick={()=>/** @type {any} */(process).browser &&
                  navigator.clipboard.writeText(`${document.location.host}/posts/${id}`)
                }
              >
                Copy link
              </UI.Menu.Item> }
          </UI.Menu>
        </div>
      </div>
    </div>
  )
}