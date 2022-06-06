import { useState, useRef } from "react";
import { TiDeleteOutline,TiZoomOutline } from "react-icons/ti"
import Router from "next/router"

export default function SearchBar(){
  const [hiddenClearButton,setHiddenClearButton] = useState(true)
  const [searchValue,setSearchValue] = useState("")
  const [hiddenSearchIcon,setHiddenSearchIcon] = useState(false)
  /** @type {import("react").MutableRefObject<HTMLInputElement>} */
  const inputElm = /** @type {any} */(useRef(null))

  /**
   * @param {import("react").FormEvent<HTMLFormElement>} e
   */
  function searchHandler(e){
    // 検索画面へ遷移させる /search?q=...
    Router.push("/search",{
      query:{
        q:searchValue
      }
    })
    e.preventDefault()
  }

  return (
    <div
      className="flex flex-row rounded-full w-full
      h-10 items-center
      bg-slate-200 cursor-text"
      onClick={()=>(inputElm).current?.focus()}
    >
      <form onSubmit={searchHandler} className="w-full flex">
      <button className={`m-4 mr-0`}>
        <TiZoomOutline size="1.5rem" />
      </button>
      <input
        ref={inputElm}
        contentEditable="true"
        className='bg-opacity-0 bg-white w-full m-2'
        value={searchValue}
        onChange={(e)=>{
          setSearchValue(e.target.value)
          setHiddenClearButton(e.target.value.length==0)
          setHiddenSearchIcon(true)
        }}
        onFocus={()=>setHiddenSearchIcon(true)}
        onBlur={(e)=>e.target.value.length == 0 && setHiddenSearchIcon(false)}
      />
      </form>
      <button className={(hiddenClearButton ? "hidden" : "block") + " m-4 ml-0"} onClick={()=>{setSearchValue("");setHiddenClearButton(true)}}>
        {/* 全消し */}
        <TiDeleteOutline size="1.5rem" />
      </button>
    </div>
  )
}