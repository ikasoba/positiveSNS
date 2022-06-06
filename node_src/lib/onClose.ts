import EventEmitter from "events";

export const onClose = new class OnClose {
  private event = new EventEmitter();
  constructor(){
    process.on("beforeExit",this.event.emit)
  }
  on(func:(...args:any[])=>void): this{
    this.event.once("exit",func)
    return this
  }
}

export default onClose