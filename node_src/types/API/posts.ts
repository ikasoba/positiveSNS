import Ajv from "ajv"

const ajv = new Ajv()

export interface newPost {
  content:string
  nsfw?:boolean,
  cw?:boolean
}

export const isNewPost = ajv.compile<newPost>({
  required:["content"],
  type:"object",
  properties:{
    content:{
      type:"string",
      maxLength:500
    },
    nsfw:{
      type:"boolean",
      nullable:true
    },
    cw:{
      type:"boolean",
      nullable:true
    }
  }
})

export const newPost = {
  toSQLData(data:newPost){
    const o:Required<newPost> = {
      content:data.content,
      nsfw:data.nsfw||false,
      cw:data.cw||false
    }
    return o
  }
}