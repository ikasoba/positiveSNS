const crypto = require('crypto');
const { default: RedisSocket } = require('redis/dist/lib/client/socket');


function sha256(str){
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

module.exports = (...args)=>new class SAL {
  r=require('express').Router();
  /**
   * 
   * @param {Client} SQLclient node-postgres client
   */
  constructor (SQLclient) {
    this.sql = SQLclient;
    const r = this.r;
    r.post('/login', async (req, res, next) => res.json(await this.login(req.body)));
  }

  get Router () { return this.r; }

  /**
   * login
   * @module SAL
   * @param  {Object}       form            - form data
   * @param  {String}       [form.address]  - mail
   * @param  {String}       [form.password] - password
   * @param  {String}       [form.betaKey]  - betaKey
   * @param  {String}       [form.oneTime]  - one time password
   * @return {*}            user
   */
  async login (form) {
    const user = (await this.sql.query("SELECT pass,mail FROM users WHERE (pass=$1) AND (mail=$2)",[sha256(form.password),sha256(form.address)])).rows[0] || {};
    const password = user.pass;
    const mail = user.mail;
    if (form.address && form.address === mail &&
        (form.password && form.password === password)) {
          user.success = true;
          return user;
        }
    user.success = false;
    return user;
  }

  async auth(username,authKey){

  }
}(...args);
