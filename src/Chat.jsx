import React, { Component } from "react";
import io from "socket.io-client";
import { connect } from "react-redux";

const socket = io.connect("http://localhost:4001");

class Chat extends Component {
  constructor() {
    super();
    this.state = {
      chatOpen: false,
      messageInput: "",
      chat: [],
    };
  }

  componentDidMount() {
    socket.emit("chatMounted");
    socket.on("chatResponse", (data) => {
      console.log("hello world");
      console.log("frontend message", data);
      if (!this.state.chatOpen) {
        let audioMessenger = new Audio("/Sounds/messenger-sound.mp3.mp3");
        audioMessenger.play();
      }

      if (this.state.chatOpen) {
        let chatMessagesContainer = document.getElementById(
          "chat-messages-container"
        );
        console.log(chatMessagesContainer.scrollHeight);
        chatMessagesContainer.scrollTop =
          chatMessagesContainer.scrollHeight + 18;
      }
      this.setState({ chat: data });
    });
  }

  componentDidUpdate() {
    if (this.state.chatOpen) {
      let chatMessagesContainer = document.getElementById(
        "chat-messages-container"
      );
      console.log(chatMessagesContainer.scrollHeight);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight + 18;
    }
  }

  // componentDidUpdate() {
  //   socket.on("message", (chat) => {
  //     console.log(chat);
  //     this.setState({ chat: chat });
  //   });
  // }

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
            <form onSubmit={this.submitChat}>
              <input
                type="text"
                value={this.state.messageInput}
                onChange={this.messageInputHandle}
              />
              <input type="submit" />
            </form>
          </div>
        ) : (
          <button onClick={this.ToggleChat} className="chat-button-closed">
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
