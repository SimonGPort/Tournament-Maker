import React, { Component } from "react";

class Chat extends Component {
  constructor() {
    super();
    this.state = {
      chatOpen: false,
    };
  }

  ToggleChat = () => {
    this.setState({ chatOpen: !this.state.chatOpen });
  };

  submitChat = () => {
    alert("Chat");
  };

  render = () => {
    return (
      <div>
        {this.state.chatOpen === true ? (
          <div className="chat-container-open">
            <button onClick={this.ToggleChat} className="chat-button-open">
              Chat
            </button>
            <div className="chat-messages-container"></div>
            <form onSubmit={this.submitChat}>
              <input type="text" />
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

export default Chat;
