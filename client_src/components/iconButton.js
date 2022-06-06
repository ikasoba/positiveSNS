import {
  TiHeartOutline,
  TiHeartFullOutline,
} from "react-icons/ti"

import {
  AiFillDislike,
  AiOutlineDislike
} from "react-icons/ai"
import { useEffect, useState } from "react"

/**
 * @type {import("react")}
 */
let React;
/**
 * @param {string} type
 * @param {boolean} checked
 */
const getColorIcon = (type,checked)=>{
  `bg-pink-500 bg-red-500 text-pink-500 text-red-500
  hover:bg-pink-500 hover:bg-red-500 hover:text-pink-500 hover:text-red-500`

  const color = type == "like"
    ? `pink`
    : type == "dislike"
    ? `red`
    : null
  const Icons = type == "like"
    ? [TiHeartOutline,TiHeartFullOutline]
    : type == "dislike"
    ? [AiOutlineDislike,AiFillDislike]
    : [()=>null,()=>null]
  return [color,Icons[~~checked]]
}

/**
 * @type {import("react").VFC}
 * @param {{
 *  type:"like"|"dislike"
 *  onClick?:(checked:boolean)=>void
 *  group?:[any,import("react").Dispatch<import("react").SetStateAction<any>>]
 * }} props
 */
export function IconButton({ type,onClick }){
  `bg-pink-500 bg-red-500 text-pink-500 text-red-500
  hover:bg-pink-500 hover:bg-red-500 hover:text-pink-500 hover:text-red-500`

  const color = type == "like"
    ? `pink`
    : type == "dislike"
    ? `red`
    : null
  const Icons = type == "like"
    ? [TiHeartOutline,TiHeartFullOutline]
    : type == "dislike"
    ? [AiOutlineDislike,AiFillDislike]
    : [()=>null,()=>null]

  const [checked,setChecked] = useState(false)
  const Icon = Icons[~~checked]
  return (
    <button
      className={`p-2 rounded-full hover:bg-opacity-10
      hover:bg-${color}-500 hover:text-${color}-500 ${checked && `text-${color}-500`}`}
      onClick={(e)=>{
        setChecked(!checked);
        if (onClick)onClick(checked)
      }}
    >
      <Icon
        size="1.5rem"
      />
    </button>
  )
}

/**
 * @type {React.FC}
 * @param {{
 *  state:[string|null,React.Dispatch<React.SetStateAction<string|null>>]
 *  value:string
 *  type:"like"|"dislike"
 *  onChange:(checked:boolean)=>void
 * }} props
 */
export function IconRadioButton({ type,value,onChange,state }){
  const [checked,setChecked] = state
  const [color,Icon] = getColorIcon(type,checked===value)
  console.log("checked",checked,value)
  return (
    <div
      className={`p-2 rounded-full hover:bg-opacity-10
        hover:bg-${color}-500 hover:text-${color}-500 ${checked === value ? `text-${color}-500` : ""}`}
      onClick={()=>{setChecked(checked === value ? null : value);onChange(checked === value ? false : true)}}
    >
      { Icon && <Icon
        size="1.5rem"
      />}
    </div>
  )
}