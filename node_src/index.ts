/*
app.use((req,res,next)=>{
  if (req.secure){
    next()
  }else{
    res.status(400).json({message:"It's not https."})
  }
}) */

// app.use("/oidc/",require("./api/oauth.js"));

// メッセージの削除など
import {SQLSchedule} from './lib/postgres.js';

SQLSchedule()

import express from "express";
import helmet from 'helmet';
import cors from "cors"

// そのまんまAPI
import api from "./api/api.js";

const app = express()

app.use(helmet());
app.use(cors());
app.disable('x-powered-by');
app.use(express.json());

// ログ用
app.use((req, res, next) => {
  console.log(`[${new Date().toUTCString()}]`, req.protocol, req.headers['x-real-ip'] || req.ip,
    req.method, req.originalUrl, "queries", req.query, 'Headers', req.headers, 'Body', req.body);
  next();
});

app.use(api)

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`起動しました! ポート->${port}`);
});
