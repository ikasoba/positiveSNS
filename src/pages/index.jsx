import React from "react";
import Message from "../components/message.jsx";
import InputBox from "../components/inputbox.jsx";

import "../styles/index.scss";

export default class Page extends React.Component {
  async render(){
    const res=await (await fetch("/posts/timeline/get")).json();
    const messages=res.map(x=>
      <Message
        name={x.}
      />
    )
    return (
      <>
        <InputBox single={true} />
        messages
      </>
    );
  }
}