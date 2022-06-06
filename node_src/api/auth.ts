import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
const {TokenExpiredError} = jwt
import {NextFunction, Request, Response, Router} from "express";
const {default:{Pool}} = await import('pg');
import Ajv from "ajv";
import addFormats from "ajv-formats";

import patterns from '../lib/patterns.js';
import config,{getProp} from "../config.js";
import onClose from '../lib/onClose.js';
import { pgRowParser,Parsers } from '../lib/pgRowParser.js';
import { User } from '../types/User.js';
import { convert } from '../lib/postgres.js';
import {nanoid} from "nanoid";
import validator from '../lib/validator.js';
import { APIError, isAPIError } from '../types/API/error.js';

const r = Router()

const pool = new Pool({
  ...config.sql()
})

onClose.on(pool.end)

const ajv = new Ajv();
addFormats(ajv);

const expires = (s:number)=>Math.floor(Date.now()/1000)+s;

const SECRET = Buffer.from(getProp<string>(process.env,"SECRET","string"),"base64");
const basicAuth = (s:string)=>Buffer.from(s,"base64").toString("ascii").split(":",2)
const genIdentifier = ()=>nanoid(18)
export const verifyToken = (tkn:string,scope?:SCOPES[]): JwtPayload|APIError =>{
  if (tkn==""){
    return APIError(`token is none`,401)
  }
  try {
    const decode = jwt.verify(tkn,SECRET,{
      algorithms:[
        "HS256"
      ]
    })
    console.log("[verify]:",decode)
    if (typeof decode === "string")return APIError("invalid_payload",400);
    if (decode.scope==null)return APIError("invalid_scope",400);
    if (decode.scope && scope)return verifyScope(decode,scope);
    return decode
  }catch(e) {
    if (e instanceof TokenExpiredError){
      return APIError(`token_expired`,401)
    }
    console.error(e)
    return APIError(`unknown_error`,401)
  }
}

export const verifyScope = (payload:JwtPayload,scope:SCOPES[]): JwtPayload => {
  console.log("[verify scope]:",scope,payload.scope)
  if (payload.scope?.includes("*") || scope.every(n=>payload.scope.includes(SCOPES[n]))){
    return payload
  }
  return APIError("access_not_allowed",403)
}

export const verify = (scope:SCOPES[],method:(req:Request, res:Response, next:NextFunction, payload:any)=>any)=>{
  return async(req:Request,res:Response,next:NextFunction)=>{
    const client = await pool.connect()
    try {
      res.header("WWW-Authenticate","Bearer")
      const authHeader =  `${req.headers.authorization}`.split(" ",2);
      if (authHeader[0]!=="Bearer"){
        return res.status(401).end(`invalid_token_type`)
      }
      const payload = verifyToken(authHeader[1],scope);
      if (isAPIError(payload)){
        return res.status(payload.status || 400).end(payload.msg)
      }else if (typeof payload === "string"){
        return res.status(401).end(`invalid_payload`)
      }
      const {rows:[id]} = await client.query(`SELECT id FROM users WHERE id=$1 LIMIT 1`,[
        payload.id
      ])
      if (id==null){
        return res.status(401).send(`user is not exists`)
      }
      return method(req,res,next,payload)
    }finally {
      client.release()
    }
  }
}

  export interface Signup {
    username: string,
    userTag: string,
    password: string,
    email: string
  }
export const Signup = {
  required:["username","userTag","password","email"],
  type:"object",
  properties:{
    username:{
      type:"string",
      maxLength:32
    },
    userTag:{
      type:"string",
      pattern:patterns.usertag.source,
      minLength:4,
      maxLength:18
    },
    password:{
      type:"string",
      maxLength:128
    },
    email:{
      type:"string",
      format:"email",
      maxLength:64
    }
  }
}
export const isSignup = ajv.compile<Signup>(Signup)
r.post("/signup",async(req,res)=>{
  const client = await pool.connect();
  try {
    if (!isSignup(req.body)){
      return res.status(400).send("invalid request body");
    }
    const body = req.body;

    if (!validator.isUserTag(body.userTag))return res.status(400).send("invalid userTag");

    const {rows:[isRegistered]} = await client.query(
      `
SELECT mail,usertag FROM users
WHERE mail=$1 AND usertag=$2 LIMIT 1
      `,[
        body.email,
        body.userTag
      ]
    )

    if (isRegistered!=undefined){
      return res.status(400).send("registered email or usertag");
    }

    const {rows:[user]} = await client.query(`
INSERT INTO users VALUES (
  gen_random_uuid(),
  $1,
  $2,
  $3,
  $4,
  current_timestamp,
  FALSE,
  0,
  0,
  0,
  '{}',
  '{}'
) RETURNING
  id,
  username,
  usertag,
  registered_at,
  verified,
  total_posts,
  "like",
  dislike
    `,[
      body.email,
      body.password,
      body.username,
      body.userTag
    ]);

    if (user==null){
      return res.status(400).send("");
    }

    res.json(user);
  }finally {
    client.release();
    res.end();
  }
})

export enum SCOPES {
  "post_msg",
  "del_msg",
  "follow",
  "unfollow",
  "like",
  "dislike",
  "del_me",
  "read_me",
  "*"
}

/*
  "query params":
    scope:
      - read
      - post_msg
      - del_msg
      - follow
      - unfollow
    expires_in:
      type: number
      min: 60*3
      max: 60*60*4
    use_refresh_token: boolean
*/
r.post("/login",async (req,res)=>{
  res.header("WWW-Authenticate","Basic")
  if (typeof req.query.scope !== "string"){
    return res.status(400).send("invalid scope value")
  }
  const query_expires_in = parseInt(`${req.query.expires_in}`)
  if (query_expires_in<60*3 || (query_expires_in>60*60*4)){
    return res.status(400).send("The query parameter expires_in exceeds the upper or lower limit.")
  }
  const expires_in = expires(query_expires_in || 60*30)
  const scope = decodeURIComponent(req.query.scope.replace(/\+/g," ")).split(" ")
  if (scope.every(x=>!Object.keys(SCOPES).includes(x))){
    return res.status(400).send("invalid scope name")
  }
  const client = await pool.connect()
  try {
    if (typeof req.headers.authorization !== "string"){
      return res.status(401).send()
    }
    const authHeader = req.headers.authorization.split(" ")
    if (authHeader[0]!=="Basic"){
      return res.status(401).send()
    }
    const [mail,pass] = basicAuth(authHeader[1])
    const {rows:[user]} = await client.query(
      `SELECT id,mail,pass FROM users WHERE mail=$1 AND pass=$2 LIMIT 1`,
      [
        mail,
        pass
      ]
    )
    console.log("mail:",mail,"pass:",pass,"user:",user)
    if (!user){
      return res.status(404).send()
    }

    const tkn = jwt.sign({
      id: user.id,
      scope: scope,
      exp: expires_in
    },SECRET)

    res.json({
      access_token: {
        token: tkn,
        expires_in: expires_in
      },
      //refresh_token:{
      //  token:tkn,
      //  expires_in:expires(60*60*30)
      //}
    })
  }finally {
    client.release()
  }
})

r.use((err:any,req:Request,res:Response,next:NextFunction)=>{
  console.error(err)
  res.send(`!ERR!`)
})

export default r;