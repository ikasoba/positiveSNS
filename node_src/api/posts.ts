import type { Pool } from "pg";
import { Router } from "express";
import validator from "../lib/validator.js";
import { APIMessage, Message } from "../types/Message.js";
import { QueryFuncs } from "../lib/postgres.js";
import { SCOPES, verify } from "./auth.js";
import { isNewPost,newPost } from "../types/API/posts.js";
import { APIError } from "../types/API/error.js";
import { APIUser } from "../types/User.js";
import { WSS } from "./ws.js";
import { JsonAny } from "../types/JSON.js";

export default function postsRouter(pool:Pool,wss:WSS){

  const queryFuncs = new QueryFuncs(pool)
  const r = Router()

  /**
   * @module api
   * @param {Object} req.query
   * @param {string} req.query.q
   */
  r.get("/search",async(req,res,next)=>{
    if (!req.query.q){
      return res.status(400).json({
        error: {
          message: `Query is empty`
        }
      });
    }
    let max = 100;
    if (typeof req.query.max === "string" && validator.isInteger(req.query.max,0,200)){
      max = parseInt(req.query.max)
    }
    console.log(req.query.q,max)
    const client = await pool.connect()
    const {rows:search} = await client.query(
      `
SELECT * FROM searchPost($1::text,$2::integer);
      `,
      [
        req.query.q,
        max
      ]
    );
    client.release()
    res.json(search);
  });

  /**
   * /posts/timeline/get は、最新のメッセージをHTTPで最大200件取得するためのAPIです
   * @module api
   * @param {Object}  req.query       - クエリーパラメータ
   * @param {number}  req.query.limit - 0から200までの数字
   */
  r.get("/timeline/get", async(req, res, next)=>{
    const limit=Math.min(parseInt(`${req.query.limit}`), 200) || 200;
    const client = await pool.connect()
    res.json(
      (await client.query(
        `
  SELECT
    *,
    row_to_json(getUser("user_id"))::jsonb as author
  FROM v_posts
  ORDER BY created_at
  DESC LIMIT $1
        `,
        [
        limit
        ]
      )).rows || []
    );
    client.release()
  });

  const likeCallbk = (like:boolean,remove?:boolean)=>verify([like ? SCOPES.like : SCOPES.dislike],async(req,res,_,payload)=>{
    const client = await pool.connect()
    if (!validator.isUUID(req.params.id)){
      return res.status(400).send("parameter is not UUID")
    }
    const columnToAdd = like ? "like" : "dislike"
    const columnToRemove = (remove ? like!=remove : like) ? "dislike" : "like"
    console.log(like,columnToAdd,columnToRemove)
    try {
      if (!remove){
        await client.query(
          `
UPDATE posts
  SET "${columnToAdd}"="${columnToAdd}"+1,
      "${columnToAdd}d_users"="${columnToAdd}d_users" || $2::UUID
  WHERE
        id=$1
    AND NOT("${columnToAdd}d_users" && ARRAY[$2::UUID])
          `,
          [
            req.params.id,
            payload.id
          ]
        )
      }
      await client.query(
        `
UPDATE posts
  SET "${columnToRemove}" = "${columnToRemove}" - 1,
      "${columnToRemove}d_users" = array_remove("${columnToRemove}d_users",$2::UUID)
  WHERE
        id=$1
    AND "${columnToRemove}d_users" && ARRAY[$2::UUID]
        `,
        [
          req.params.id,
          payload.id
        ]
      )
      const {rows:[post]} = await client.query(
        `
SELECT
  *,
  row_to_json(getUser("user_id"))::jsonb as author
FROM v_posts
WHERE
  id=$1
LIMIT 1
        `,
        [
          req.params.id
        ]
      )
      if (post==null){
        return res.status(404).send(`post ${req.params.id} is not exists`)
      }
      return res.status(200).json(post)
    }finally {
      client.release()
    }
  })

  r.post("/:id/like",likeCallbk(true))
  r.post("/:id/dislike",likeCallbk(false))
  r.delete("/:id/like",likeCallbk(true,true))
  r.delete("/:id/dislike",likeCallbk(false,true))

  /**
   * /posts/new は、メッセージをHTTPで生成するためのAPIです
   * @module api
   * @param {Object}    req.body                      - リクエストボディ
   * @param {string}    req.body.user_id              - 有効なユーザーのUUIDv4である必要がある
   * @param {string}    req.body.content              - 本文
   * @param {boolean}   req.body.nsfw                 - 閲覧注意
   * @param {boolean}   req.body.cw                   - ネタバレ注意
   * @param {string[]}  [req.body.attachments=[]]     - 追加のイメージ
   * @param {number}    [req.body.privacy=0]          - プライバシー 0:全体公開 | 1:フォロワーのみ
   */
  r.post("/new", verify([SCOPES.post_msg],async(req, res, _, payload) => {
    const client = await pool.connect()
    if (!isNewPost(req.body)){
      return res.status(400).send(APIError("invalid_body"))
    }else if (req.body.content.replace(/\r\n|\s/g,"").length == 0){
      return res.status(400).json(APIError("invalid_content"))
    }
    try {
      const {rows:[msg]}:{rows:APIMessage[]} = await client.query<APIMessage>(
        `
  INSERT INTO posts VALUES (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    0,
    $4,
    $5,
    current_timestamp,
    0,
    0,
    '{}',
    '{}'
  ) RETURNING
    id,
    "user_id",
    content,
    privacy,
    nsfw,
    cw,
    created_at,
    "like",
    dislike,
    liked_users,
    disliked_users,
    "user_id" as author
        `
        ,[
          payload.id,
          req.ip,
          ...(
            Object.values(newPost.toSQLData(req.body))
          )
        ]
      )
      msg.author = await queryFuncs.getUser(msg.user_id)
      console.log("[/posts/new]:",msg)
      wss.broadCast(msg as unknown as JsonAny)
      return res.json(msg)
    }finally {
      client.release()
    }
  }))

  /**
   * /posts/:id は、特定のメッセージを取得するためのAPIです
   * @module api
   * @param {Object}  req.params      - パスパラメータ
   * @param {string}  req.params.id   - 特定のメッセージのUUIDv4
   */
  r.get("/:id", async(req, res, next)=>{
    if (!validator.isUUID(req.params.id)) {
      res.status(400).json({
        error: {
          message: `invalid message id`
        }
      });
      return;
    }
    const message:null|APIMessage = await queryFuncs.getMessage(req.params.id)
    if (!message)return res.status(404).send("");
    res.json(
      message
    );
  });

  r.delete("/:id", verify([SCOPES.del_msg],async(req, res, next)=>{
    if (!validator.isUUID(req.params.id)) {
      res.status(400).json({
        error: {
          message: `invalid message id`
        }
      });
      return;
    }
    const client = await pool.connect()
    try {
      const {rows:[message]} = await client.query(
        `
DELETE FROM posts WHERE id=$1 RETURNING *
        `,
        [
          req.params.id
        ]
      )
      if (!message)return res.status(404).send(`message ${req.params.id} is not exists`);
      res.json(
        Message.toAPIMessage(message,await queryFuncs.getUser(message.user_id) as APIUser)
      );
    }finally {
      client.release()
    }
  }));

  return r

}