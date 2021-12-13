module.exports = class Message {

  /**
   * MessageオブジェクトをJSONから生成します。
   * @param {Object} obj
   * @returns {Message}
   */
  static createFromJSON(obj){
    const arg=[
      null,null,null,null,[],[],0,null,null,new Date().toJSON(),0,0
    ];
    const constructorArgs=[
      "id","userId","ip","content","attachments","embed","privacy","nsfw","cw",
      "createdAt","like","dislike"
    ];
    for (const x in Object.keys(obj)){
      arg[constructorArgs.indexOf(x)]=
        obj[x] || obj[x.replaceAll(/([A-Z])/g,(_,p1)=>`_${p1.toLowerCase()}`)];
    }
    return new Message(arg);
  }

  constructor(
    id,userId,ip,content,attachments,card,privacy,nsfw,cw,createdAt,like,dislike,
    likedUsers,dislikedUsers
  ){
    this.id=id;
    this.userId=userId;
    this.ip=ip;
    this.content=content;
    this.attachments=attachments;
    this.card=card;
    this.privacy=privacy;
    this.nsfw=nsfw;
    this.cw=cw;
    this.createdAt=createdAt;
    this.like=like;
    this.dislike=dislike;
    this.likedUsers=likedUsers;
    this.dislikedUsers=dislikedUsers;
  }
  like(userId){
    if (!this.likedUsers.find(x=>x===userId)){
      this.likedUsers.push(userId);
      this.like++;
      return true;
    }
    return false;
  }
  removeLike(userId){
    if (this.likedUsers.find(x=>x===userId)){
      this.likedUsers.some((v,i)=>v===userId ? this.likedUsers.splice(i,1) : null);
      this.like--;
      return true;
    }
    return false;
  }
  dislike(userId){
    if (!this.dislikedUsers.find(x=>x===userId)){
      this.dislikedUsers.push(userId);
      this.like++;
      return true;
    }
    return false;
  }
  removeDislike(userId){
    if (this.dislikedUsers.find(x=>x===userId)){
      this.dislikedUsers.some((v,i)=>v===userId ? this.dislikedUsers.splice(i,1) : null);
      this.like--;
      return true;
    }
    return false;
  }
};