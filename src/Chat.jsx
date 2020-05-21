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
      console.log("frontend message", data);
      this.setState({ chat: data });
    });
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
            <div className="chat-messages-container">
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
