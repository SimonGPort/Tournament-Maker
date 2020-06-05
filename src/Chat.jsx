import React, { Component } from "react";
import io from "socket.io-client";
import { connect } from "react-redux";

// const socket = io.connect("http://localhost:4002");
const socket = io.connect("http://localhost:4000");
let backgroundColor = false;
let intervalPopUp = false;

class Chat extends Component {
  constructor() {
    super();
    this.state = {
      chatOpen: false,
      messageInput: "",
      chat: [],
      messageToRead: false,
    };
  }

  componentDidMount() {
    socket.emit("chatMounted");
    socket.on("chatResponse", (data) => {
      if (!this.state.chatOpen && data.status === "messageReceived") {
        let audioMessenger = new Audio("/Sounds/messenger-sound.mp3");
        audioMessenger.play();
        this.setState({ messageToRead: true });
      }

      if (this.state.chatOpen) {
        let chatMessagesContainer = document.getElementById(
          "chat-messages-container"
        );
        chatMessagesContainer.scrollTop =
          chatMessagesContainer.scrollHeight + 18;
      }
      this.setState({ chat: data.chat });
    });
  }

  componentDidUpdate() {
    if (this.state.chatOpen) {
      if (this.state.messageToRead) {
        intervalPopUp = false;

        this.setState({ messageToRead: false });
      }
      let chatMessagesContainer = document.getElementById(
        "chat-messages-container"
      );
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight + 18;
    }

    if (this.state.messageToRead && !intervalPopUp) {
      intervalPopUp = true;
      this.messagePopUp();
    }
  }

  messagePopUp = () => {
    let chatButtonClosed = document.getElementById("chat-button-closed");
    backgroundColor = !backgroundColor;
    if (chatButtonClosed) {
      backgroundColor
        ? (chatButtonClosed.style.backgroundColor = "blue")
        : (chatButtonClosed.style.backgroundColor = "");
    }

    if (!this.state.messageToRead) {
      backgroundColor = false;
      if (chatButtonClosed) {
        chatButtonClosed.style.backgroundColor = "";
      }
    } else if (this.state.messageToRead) {
      setTimeout(this.messagePopUp, 1000);
    }
  };

  ToggleChat = () => {
    this.setState({ chatOpen: !this.state.chatOpen });
  };

  messageInputHandle = (evt) => {
    this.setState({ messageInput: evt.target.value });
  };

  submitChat = (evt) => {
    evt.preventDefault();
    socket.emit("message", {
      message: this.state.messageInput,
      user: this.props.user,
    });
    this.setState({ messageInput: "" });
  };

  render = () => {
    return (
      <div className="chat-container">
        {this.state.chatOpen === true ? (
          <div className="chat-container-open">
            <button onClick={this.ToggleChat} className="chat-button-open">
              Chat
            </button>
            <div
              className="chat-messages-container"
              id="chat-messages-container"
            >
              {this.state.chat.map((message, idx) => {
                return (
                  <div key={idx}>
                    {message.user}: {message.message}
                  </div>
                );
              })}
            </div>
            <form onSubmit={this.submitChat} className="input-chat-container">
              <input
                type="text"
                className="input-chat"
                value={this.state.messageInput}
                onChange={this.messageInputHandle}
              />
              <input type="submit" value="Send" />
            </form>
          </div>
        ) : (
          <button
            onClick={this.ToggleChat}
            className="chat-button-closed"
            id="chat-button-closed"
          >
            Chat
          </button>
        )}
      </div>
    );
  };
}

let mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(Chat);
