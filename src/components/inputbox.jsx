import React from "react";
import Twemoji from "react-twemoji";

import "../styles/inputbox.scss";

export default class InputBox extends React.Component {
  constructor(props){
    super(props);
    this.state={redraw:0};
  }
  render(){
    return (
      <div class="inputbox" style={{
        overflowY:this.props.single ? "hidden" : "auto"
      }} contentEditable={true} onKeyDown={(e)=>{
        if (e.isComposing || e.keyCode === 229){
          return;
        }
        if (e.key==="Enter" && this.props.single)e.preventDefault();
      }}>
      </div>
    );
  }
}