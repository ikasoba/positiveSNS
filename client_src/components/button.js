/** @type {import("react")} */
let React;

/**
 * @type {React.FC}
 * @param {React.PropsWithChildren<{}> & {
 *  square?:boolean
 *  onClick?:React.MouseEventHandler<HTMLButtonElement>
 *  className?:string
 *  children:import("react").ReactNode
 * }} props
 */
export default function Button(props){
  return (
    <button
      onClick={props.onClick}
      className={`bg-slate-200 p-2 pl-4 pr-4 ${props.square ? "rounded-xl" : "rounded-full"} active:bg-slate-400 hover:bg-slate-300 flex justify-center select-none ` + props.className}
    >
      {props.children}
    </button>
  )
}