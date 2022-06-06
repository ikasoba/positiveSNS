import express, { NextFunction } from 'express';
const {default:{Pool}} = await import('pg');

import config from "../config.js";
import authRouter from "./auth.js";
import onClose from '../lib/onClose.js';

import usersRouter from "./users.js"
import postsRouter from "./posts.js"
import { WSS } from './ws.js'

const r = express.Router()

const pool = new Pool({
  ...config.sql()
})
onClose.on(pool.end)

const wss = new WSS()

r.use("/auth",authRouter)
r.use("/users",usersRouter(pool))
r.use("/posts",postsRouter(pool,wss))
r.use("/ws",wss.adapt())

export default r;