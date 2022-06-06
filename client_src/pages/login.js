import { useState } from "react";
import Button from "../components/button";
import { encode } from 'js-base64';
import APIClient,{endPoint} from "../API/client";
import Router from "next/router";
import { useTranslation } from "react-i18next";

const client = new APIClient()

export default function Login(){
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const {t} = useTranslation()
  return (
    <div className="w-screen h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl">{t("loginForm.login")}</h1>
      <div className="flex-col flex md:w-1/2 w-full">
        <input placeholder={t("loginForm.email")} className="bg-slate-200 p-2 pl-4 pr-4 rounded-full m-2" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder={t("loginForm.password")} className="bg-slate-200 p-2 pl-4 pr-4 rounded-full m-2" value={password} onChange={e=>setPassword(e.target.value)} />
        <Button className="m-2" onClick={async()=>{
          try {
            console.log(encode(`${email}:${password}`))
            const res = await fetch(`${endPoint}/auth/login?scope=*`,{
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${encode(`${email}:${password}`)}`
              },
              body: ""
            })
            const json = await res.json()
            client.db.set("token",json.access_token.token)
            client.db.set("current_user",await client.getMe())
            Router.push("/")
          }catch(e) {
            setEmail("")
            setPassword("")
            console.log(e)
          }
        }}>{t("loginForm.login")}</Button>
      </div>
    </div>
  )
}