import { APIMessage } from "./Message";

export type JsonAny =
    number
  | string
  | boolean
  | {toJSON(): JsonAny}
  | null | undefined
  | JsonAny[]
  | {[k:string]: JsonAny};
export type Json<I extends JsonAny = JsonAny> = I