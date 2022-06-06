import {Router} from "express";
import type { Pool } from "pg";
import { User } from "../types/User.js";
import { SCOPES, verify } from "./auth.js";

export default (pool:Pool)=>{

  const r = Router()

  r.get("/me",verify([],async (req,res,_,payload) => {
    const client = await pool.connect()
    try {
      const {rows:[user]} = (await client.query(
        `
SELECT * FROM v_users WHERE id=$1 LIMIT 1
        `,
        [
          payload.id
        ]
      ))
      console.log("hogehoge")
      return res.json(user)
    }finally {
      client.release()
    }
  }))

  r.delete("/me",verify([SCOPES.del_me],async (req,res,_,payload) => {
    const client = await pool.connect()
    try {
      const {rows:[user]} = (await client.query(
        `
DELETE FROM users WHERE id=$1 RETURNING *
        `,
        [
          payload.id
        ]
      ))
      if (user==null)return res.status(404).send(`user ${payload.id} is not exists`);
      return res.json(User.toAPIUser((user)))
    }finally {
      client.release()
    }
  }))

  r.get("/:id",async (req,res,_) => {
    const client = await pool.connect()
    try {
      const {rows:[user]} = await client.query(
        `
SELECT * FROM v_users WHERE id=$1 LIMIT 1
        `,
        [
          req.params.id
        ]
      )
      return res.json(user)
    }finally {
      client.release()
    }
  })

  return r

}