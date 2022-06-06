export function APIError(msg:string,status?:number): APIError {
  return {
    err:true,
    msg,
    status
  }
}

export function isAPIError(err:any): err is APIError {
  return (
    err?.err === true && typeof err?.msg === "string"
  )
}
export interface APIError {
  err:true
  msg:string
  status?:number
}
