export interface User {
  id:string,
  mail:string,
  pass:string,
  username:string,
  usertag:string,
  verified:boolean,
  registered_at:Date,
  like:number,
  dislike:number,
  total_posts:number,
  liked_users:string,
  disliked_users:string
}

export interface APIUser {
  id:string,
  username:string,
  usertag:string,
  registered_at:Date,
  verified:boolean,
  total_posts:number,
  like:number,
  dislike:number,
  liked_users:string,
  disliked_users:string
}

export class User {
  static toAPIUser(
    msg:User|APIUser
  ):APIUser {
    return {
      id: msg.id,
      username: msg.username,
      usertag: msg.usertag,
      registered_at: msg.registered_at,
      verified: msg.verified,
      total_posts: msg.total_posts,
      like: msg.like,
      dislike: msg.dislike,
      disliked_users: msg.disliked_users,
      liked_users: msg.liked_users
    }
  }
}