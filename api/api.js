/* global process */

const express         = require('express');
const r               = express();
const expressWs       = require('express-ws')(r);
const { Client }      = require('pg');
const { v4: uuidv4 }  = require('uuid');
const helmet          = require('helmet'); 

const GraphqlRoot = require("./graphql.js");

const allIncluded = (arr, arr2) => {
  let res = 0;
  arr.forEach((x) => {res += arr2.includes(x);});
  return arr2.length === res;
};

const wsUtil = {
  async sendAll(data) {
    expressWs.getWss().clients.forEach((x) => {
      x.send(JSON.stringify(data));
    });
  },
  /**
   * e はイベント構造体を作成します
   * @module api.wsUtil
   * @param  {string} eventName   - event name
   * @param  {string} data        - event data
   * @return {Object}             - event struct
   */
  e(eventName, data) {
    return {
      event: eventName,
      data: data
    };
  }
};


const mesUtil = new class {
  /**
   * @param {Object|Object[]} msg
   */
  async addUserdata(msg){
    if (msg instanceof Array){
      return await Promise.all(
        msg.map(async (x)=>x.user = (await client.query(`SELECT * FROM users WHERE id=$1`,[msg.user_id])).rows[0] )
      );
    }else{
      msg.user = (await client.query(`SELECT * FROM users WHERE id=$1`,[msg.user_id])).rows[0];
      return msg;
    }
  }
}();

//  Postgresql

const client = new Client({
  user: 'postgres', 
  host: process.env.postgresHOST,
  database: 'postgres',
  password: 'root',
  port: 5432
});
const SAL = require("./sal.js")(client);

client.connect();

r.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

r.use(helmet());
r.disable('x-powered-by');
r.use(express.json());

const wsClients = [];

/**
 * /posts/ws は、websocketでタイムラインを取得するためのAPIです
 * @module api
 */
r.ws("/posts/ws", async(ws, req) => {
  ws.on("message", async(data,isBinary) => {
    const data = JSON.stringify(data);
    /**
      * login
      * @module SAL
      * @param  {Object}       form            - form data
      * @param  {String}       [form.address]  - mail
      * @param  {String}       [form.password] - password
      * @param  {String}       [form.betaKey]  - betaKey
      * @param  {String}       [form.oneTime]  - one time password
      * @return {boolean}      accept
      */
    let user=await SAL.login(data["d"]);
    if (data["m"]==="login" && user.success){
      wsClients.push({
        client:ws,
        user:user.id
      });
    }
  });
});

/**
 * /posts/get/:id は、特定のメッセージを取得するためのAPIです
 * @module api
 * @param {Object}  req.params      - パスパラメータ
 * @param {string}  req.params.id   - 特定のメッセージのUUIDv4
 */
r.get("/posts/get/:id", async(req, res, next)=>{
  if (String(req.params.id).match(/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/)===null) {
    res.status(400).json({
      error: {
        message: `The request does not contain the minimum information.`
      }
    });
    return;
  }
  res.json(
    (await client.query("SELECT * FROM posts WHERE id=$1::UUID", [
      req.params.id
    ])).rows[0] || null
  );
});

/**
 * @module api
 * @param {Object} req.query
 * @param {string} req.query.q
 */
r.get("/posts/search",async(req,res,next)=>{
  if (!req.query.q){
    res.status(400).json({
      error: {
        message: `Query is empty`
      }
    });
  }
  const {rows:search}=await client.query(`SELECT * FROM posts WHERE (regexp_matches(content,$1) IS NOT NULL)`,[
    req.query.q
  ]);
  res.json(search);
});

/**
 * /posts/timeline/get は、最新のメッセージをHTTPで最大200件取得するためのAPIです
 * @module api
 * @param {Object}  req.query       - クエリーパラメータ
 * @param {number}  req.query.limit - 0から200までの数字
 */
r.get("/posts/timeline/get", async(req, res, next)=>{
  const limit=Math.min(req.query.limit, 200) || 200;
  res.json(
    (await client.query("SELECT * FROM posts ORDER BY created_at DESC LIMIT $1", [
      limit
    ])).rows || []
  );
});

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
r.post("/posts/new", async(req, res, next) => {
  if (!allIncluded(Object.keys(req.body),['user_id','content',"nsfw","cw"])) {
    res.status(400).json({
      error: {
        message: 'The request does not contain the minimum information.'
      }
    });
    return;
  }else if (){

  }
  const uuid=uuidv4();
  await client.query(`INSERT INTO posts (id,user_id,ip,content,card,privacy,nsfw,cw,created_at,"like","dislike") VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        current_timestamp,
                        0,
                        0
                      )`,
    [
      uuid,
      req.body["user_id"],
      req.ip,
      req.body["content"],
      null,
      req.body["card"],
      req.body["privacy"]     || 0,
      req.body["nsfw"],
      req.body["cw"]
    ]
  );
  await client.query(`UPDATE users SET "totalPosts" = "totalPosts" + 1 WHERE id=$1;`,
    [req.body["user_id"]]
  );
  const data=await client.query(`SELECT * FROM posts WHERE id = $1::UUID;`,
    [uuid]
  );
  wsUtil.sendAll(wsUtil.e("update",data["rows"][0]));
  res.json(data.rows[0]);
});

module.exports = r;