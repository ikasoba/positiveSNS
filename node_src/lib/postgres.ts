import Time from "./Time.js";
import config from "../config.js";
import {APIUser, User} from "../types/User.js";
import validator from "./validator.js";
import onClose from "./onClose.js";
import { APIMessage, Message } from "../types/Message.js";
import cron from "node-cron";

const {Pool} = (await import("pg")).default

const pool = new Pool({
	...config.sql(),
	max:2
});
onClose.on(pool.end)

export function SQLSchedule(){
	cron.schedule("0 0 */4 * * *",async ()=>{
		const client = await pool.connect();
		client.query(`DELETE FROM posts WHERE ("like" <= 0
			OR "like" < dislike)
			AND EXTRACT( DAY FROM current_timestamp - created_at ) >= 1;`);
		client.release();
	});
}

export const invalidOr = <A=any,B=any>(a:A,b:B,isValid:(v:A)=>boolean) => isValid(a) ? a : b

export class QueryFuncs {
	constructor(
		public pool:import("pg").Pool
	){}

	getUser(username:string,password:string): Promise<APIUser|null>
	getUser(uuid:string): Promise<APIUser|null>

	async getUser(...args:[string,string]|[string]): Promise<APIUser|null> {
		const isFromId = (args:unknown[]): args is [string] =>
			args.length == 1
			&& typeof args[0] === "string"
			&& validator.isUUID(args[0])
		const isFromPassword = (args:unknown[]): args is [string,string] =>
			args.length == 2
			&& typeof args[0] === "string"
			&& typeof args[1] === "string"
		const client = await this.pool.connect()
		try {
			if (isFromPassword(args)){
				const [email,password] = args
				return (await client.query(
					`
SELECT * FROM v_users
	WHERE email=$1 AND password=encode(digest($1,'sha256'),'hex')
	LIMIT 1
					`,
					[
						email,
						password
					]
				)).rows[0]
			}else if (isFromId(args)){
				const [id] = args
				return (await client.query(
					`
					SELECT * FROM getUser($1::UUID)
					`,
					[
						id
					]
				)).rows[0]
			}else{
				throw new Error(`invalid parameters`);
			}
		}finally {
			client.release()
		}
	}

	async resolveAuthor(_o: unknown & {author: string}): Promise<typeof o & {author: APIUser|null}> {
		const o:any = {..._o}
		o.author = await this.getUser(o.author)
		return o
	}

	async getMessage(id:string): Promise<null|APIMessage> {
		if (!validator.isUUID(id))throw new Error(`parameter is not uuid!`);
		const client = await this.pool.connect()
		try {
			const {rows:[message]}:{rows:APIMessage[]} = await client.query(`SELECT * FROM getPost($1)`,[id])
			return message
		}finally {
			client.release()
		}
	}
}

export const convert = {
	boolean:(s:string):boolean|null => 
/**/ s==="TRUE"
	|| s==="t"
	|| s==="true"
	|| s==="y"
	|| s==="yes"
	|| s==="on"
	|| s==="1"
		? true
	:	 s==='FALSE'
	|| s==='f'
	|| s==='false'
	|| s==='n'
	|| s==='no'
	|| s==='off'
	|| s==='0'
		? false
		: null,
	timestamp:(s:string):Date|null => invalidOr(new Date(s),null,(d:Date)=>isNaN(d.valueOf())),
	integer:(s:string):number|null => invalidOr(parseInt(s),null,isNaN)
}