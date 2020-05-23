import React, { Component } from "react";
import Chat from "./Chat.jsx";
import Rooms from "./Rooms.jsx";

class MainPage extends Component {
  render = () => {
    return (
      <>
        <Rooms />
        <Chat />
      </>
    );
  };
}

export default MainPage;
