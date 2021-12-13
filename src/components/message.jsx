import React from "react";
import Twemoji from 'react-twemoji';
import lang from "../translate/index.js";

import '../styles/message.scss';
import "../styles/emoji.scss";

export default class Message extends React.Component {
  render(){
    const language="ja-jp";
    const now=new Date();
    const sub=now.getTime()-this.props.date.getTime();
    let date;
    if      (sub>=0 && sub<=1000*59)date=`${lang.Date.now[language]}`;
    else if (sub>1000*60 && sub<=1000*60*60)date=`${Math.round(sub/1000/60/60)}${lang.Date.minutesAgo[language]}`;
    else if (sub>1000*60*59 && sub<=1000*60*60*24)date=`${Math.round(sub/1000/60/60)}${lang.Date.hoursAgo[language]}`;
    else if (sub>1000*60*60 && sub<=1000*60*60*24)date=lang.Date.yestersday[language];
    else if (sub>1000*60*60*24 && sub<=1000*60*60*24*29)date=`${Math.round(sub/1000/60/60/24)}${lang.Date.daysAgo[language]}`;
    else if (sub>1000*60*60*24*30 && sub<=1000*60*60*24*360)date=`${Math.round(sub/1000/60/60/24/30)}${lang.Date.monthAgo[language]}`;
    else    date=`${now.getFullYear()}/${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    

    return (
      <Twemoji options={{ext:".svg",folder:"svg"}} class="message_wrap">
        <div class="message">
          <div class="message_head">
            {/*ICON NAME DATE*/}
            <div class="message_head_name_icon_wrap">
              <div class="icon">
                {this.props.icon}
              </div>
              <div>{this.props.name}</div>
            </div>
            <div class="date">{date}</div>
          </div>
          <div class="message_content">
            {this.props.content}
          </div>
        </div>
        <div class="message_hooter">
          0👍 👎
        </div>
      </Twemoji>
    );
  }
}