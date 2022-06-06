import { JsonAny } from "../JSON"

export type EventNames = "heartbeat"

export interface Event {
  e: EventNames
  id: string
}

export interface Reply {
  id: string
  msg?: JsonAny
}