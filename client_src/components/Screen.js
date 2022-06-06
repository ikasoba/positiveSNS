import Head from 'next/head'
import Message from '../components/message'
import MessageForm from '../components/messageForm'
import SearchBar from '../components/SearchBar'
import TimeLine from '../components/TimeLine'
import {TiThMenu, TiZoom, TiHome, TiSpanner } from "react-icons/ti"
import UI from '../components/UI'
import Router from 'next/router'
import Link from 'next/link'

/**
 * @type {import("react").VFC}
 * @param {{direction:"vertical"|"horizontal"}} props
 */
function MenuBar({direction}){
  return (
    <UI.MenuBar
      direction={direction}
      className={direction=="vertical" ? "md:hidden fixed bottom-0" : "lg:w-1/2"}
    >
      <Link href="/"><a>
        <UI.MenuBar.Button
          name="HOME"
          Icon={TiHome}
        />
      </a></Link>
      <Link href="/search"><a>
        <UI.MenuBar.Button
          name="SEARCH"
          Icon={TiZoom}
        />
      </a></Link>
      <Link href="/settings"><a>
        <UI.MenuBar.Button
          name="SETTINGS"
          Icon={TiSpanner}
        />
      </a></Link>
    </UI.MenuBar>
  )
}

/**
 * @type {import("react").FC}
 * @param {import('react').PropsWithChildren<{}>} props
 */
export default function Screen({children}){
  return (
    <div className="flex md:flex-row flex-col w-full justify-center h-screen">
      <div
        className='lg:basis-3/12
        md:flex lg:w-auto
        w-20 hidden max-w-sm
        flex-col items-center lg:items-end'
      >
        <MenuBar
          direction='horizontal'
        />
      </div>
      <div
        className="w-full lg:max-w-xl md:border-l-2 md:border-r-2
        md:border-gray-200 h-full box-border"
        style={{paddingBottom:"100%"}}
      >
        <div className='scroll-auto'>
          {children}
        </div>
        <MenuBar
          direction='vertical'
        />
      </div>
      <div className='max-w-sm basis-3/12 lg:w-full hidden lg:block p-2'>
        <SearchBar />
      </div>
    </div>
  )
}