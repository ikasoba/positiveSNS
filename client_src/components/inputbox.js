import { useState } from "react"

export default function Inputbox({maxLines}){
  const [value,setValue] = useState(null)
  return (
    <div
      contentEditable
      className="rounded-xl bg-slate-200 min-h-0"
    >

    </div>
  )
}