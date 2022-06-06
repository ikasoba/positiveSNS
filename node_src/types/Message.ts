import { APIUser, User } from "./User.js"
export interface Message {
  id							:string
	user_id					:string
	ip							:string
	content					:string
	privacy					:number
	nsfw						:boolean
	cw							:boolean
	created_at			:Date
	like						:number
	dislike					:number
	liked_users			:string[]
	disliked_users	:string[]
}

export class Message {
	static toAPIMessage(msg:Message,author?:User|APIUser): APIMessage {
		return {
			id							: msg.id,
			user_id					: msg.user_id,
			content					: msg.content,
			privacy					: msg.privacy,
			nsfw						: msg.nsfw,
			cw							: msg.cw,
			created_at			: msg.created_at,
			like						: msg.like,
			dislike					:	msg.dislike,
			liked_users			:	msg.liked_users,
			disliked_users	:	msg.disliked_users,
			author					:	author && User.toAPIUser(author) || null
		}
	}
}

export let messageKeys:keyof Message
export interface APIMessage {
	id							:	string,
	user_id					: string,
	content					:	string,
	privacy					:	number,
	nsfw						:	boolean,
	cw							:	boolean,
	created_at			:	Date,
	like						:	number,
	dislike					:	number,
	liked_users			:	string[],
	disliked_users	:	string[]
	author?					:	APIUser|null
}