import { WebSocket, WebSocketServer } from "ws";
import { Json, JsonAny } from "../types/JSON.js";
import { Event, Reply } from "../types/API/ws.js"
import { nanoid } from "nanoid";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import Time from "../lib/Time.js"
import { Request, Response } from "express";

const ajv = new Ajv();
addFormats(ajv);

export const isReply = ajv.compile<Reply>({
  type: "object",
  properties: {
    msg: {
      type: ["string","number","boolean","null","array","object"]
    },
    id: {
      type: "string"
    }
  },
  required: ["e","id"]
})

// express-wsがメンテされてないみたいだし自前実装です。
export class WSS {
  private wss = new WebSocketServer({noServer:true})
  private clients:Set<readonly [()=>number,WebSocket]> = new Set()

  constructor(){
    const autoClose = () => setTimeout(async()=>{
      Promise.all([...this.clients].map(async x => {
        if (Date.now()-x[0]() >= Time.min(10)){
          x[1].close()
          this.clients.delete(x)
        }
      }))
      autoClose()
    },Time.min(5));
    this.wss.on("connection",ws => {
      const id = nanoid()
      const msgs = new Set<Event>()
      let lastHeartbeat = Date.now()
      const session = [()=>lastHeartbeat,ws] as const
      this.clients.add(session)
      ws.on("open",() => {
        const msg:Event = {
          e: "heartbeat",
          id: nanoid()
        }
        msgs.add(msg)
        ws.send(msg)
      })
      ws.on("close",()=>{
        this.clients.delete(session)
      })
      ws.on("message",(rawData,isBinary) => {
        if (isBinary)return;
        const msg:JsonAny = JSON.parse(rawData.toString("utf8"));
        if (!isReply(msg))return;
        const e = [...msgs].find(x => x.id === msg.id)
        if (e == undefined)return;
        lastHeartbeat = Date.now()
        msgs.delete(e)
      })
    })
  }

  broadCast(json:Json){
    this.wss.clients.forEach(ws => ws.send(JSON.stringify(json)))
  }

  adapt(){
    return (req:Request,res:Response) => {
      res.writeHead(101,"Web Socket Protocol Handshake",{
        "Upgrade": "WebSocket",
        "Connection": "Upgrade"
      })
      if (req.headers["upgrade"] !== "websocket")res.status(400).end("");
      console.log(req.socket.readableLength ? req.socket.read(Math.min(req.socket.readableLength,1024**3)) : null)
      const head = Buffer.from([])
      this.wss.handleUpgrade(req, req.socket, head, ws => {
        this.wss.emit("connection", ws, req)
      })
    }
  }
}