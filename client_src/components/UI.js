import React,{ Children, createRef, useEffect, useRef, useState } from "react"
import styles from "../styles/UI.module.css"

export const UI = {
  MenuBar:(()=>{
    /**
     * @type {React.FC}
     * @param {{
     *  name:string
     *  Icon:import("react-icons").IconType
     *  onClick?:()=>void
     * }} props
     */
    function Button({name,Icon,onClick}){
      const className = "flex flex-col items-center select-none w-full hover:bg-slate-200 p-2 transition"
      return (
        <button
          className={className}
          onClick={onClick}
        >
          <Icon size="1.5rem" />
          <span>{name}</span>
        </button>
      )
    }
    /**
     * @type {React.FC}
     * @param {React.PropsWithChildren<{
     *  direction?:"vertical"|"horizontal"
     *  className?:string
     * }>} props
     */
    function MenuBar({direction,children,className}){
      return (
        <div
          className={className + ` border-t-gray-200 bg-white flex ${ direction=="vertical" ? "w-full flex-row items-center border-t-2" : "flex-col" } justify-evenly`}
        >
          {children}
        </div>
      )
    }
    MenuBar.Button = Button
    return MenuBar
  })(),
  Menu:class Menu extends React.Component {
    /**
     * @param {import("react").PropsWithChildren<{btnContent:import("react").ReactNode}>} props
     */
    constructor(props){
      super(props)
      this.state = {
        visible:false,
        style:{}
      }
      /** @type {React.RefObject<HTMLDivElement>} */
      this.container = createRef()
      /** @type {React.RefObject<HTMLDivElement>} */
      this.menuItems = createRef()
    }
    /**
     * @type {React.FC}
     * @param {import("react").PropsWithChildren<{onClick?:()=>void}>} props
     */
    static Item({children,onClick}){
      return (
        <button className={`hover:bg-slate-200 p-2 ${styles.menu} flex`} onClick={onClick}>
          {children}
        </button>
      )
    }
    /**
     * @param {React.ComponentState} prevState
     * @param {any} _
     */
    componentDidUpdate(_,prevState){
      if (this.menuItems.current==null)return;
      if (this.state.visible===prevState.visible)return;
      const x = this.menuItems.current?.offsetLeft
      const y = this.menuItems.current?.offsetTop
      const sx = this.menuItems.current?.clientWidth
      const sy = this.menuItems.current?.clientHeight
      console.log(x,y)
      this.setState({
        style:{
          top:(document.body.offsetTop+document.body.clientHeight)-(y+sy)<0
            ? y+(document.body.offsetTop+document.body.clientHeight)-(y+sy)-4
            : "none",
          left:(document.body.offsetLeft+document.body.clientWidth)-(x+sx)<0
            ? x+(document.body.offsetLeft+document.body.clientWidth)-(x+sx)-4
            : "none"
        }
      })
    }
    /**
     * @param {MouseEvent} e
     */
    bodyEventHandler = (e)=>{
      if (this.state.visible && !this.container.current?.contains(/** @type {Node|null} */(e.target)))this.setState({visible:false})
    }
    componentWillUnmount(){
      document.body.removeEventListener("click",this.bodyEventHandler)
    }
    render(){
      if (/** @type {any} */(globalThis?.document))document.body.addEventListener("click",this.bodyEventHandler)
      return (
        <div ref={this.container}>
          <button onClick={()=>this.setState({visible:!this.state.visible})}>
            {this.props.btnContent}
          </button>
          {this.state.visible &&
            <div className="z-50 rounded-xl bg-white border-2 border-gray-200 flex flex-col fixed max-w-full break-all" ref={this.menuItems} style={this.state.style}>{this.props.children}</div>
          }
        </div>
      )
    }
  }
}

export default UI