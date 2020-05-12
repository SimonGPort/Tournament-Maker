import React, { Component } from "react";
import Chat from "./Chat.jsx";
import Rooms from "./Rooms.jsx";

class MainPage extends Component {
  render = () => {
    return (
      <div>
        <div>MainPage</div>
        <Rooms />
        <Chat />
      </div>
    );
  };
}

export default MainPage;
