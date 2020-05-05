import React, { Component } from "react";
import { connect } from "react-redux";

class UserAlert extends Component {
  constructor() {
    super();
    this.state = {
      user: "",
    };
  }

  userName = (evt) => {
    this.setState({
      user: evt.target.value,
    });
  };

  submitHandler = async (evt) => {
    evt.preventDefault();
    if (this.state.user === "") {
      alert("Enter your name");
      return;
    }

    let data = new FormData();
    data.append("user", this.state.user);
    let response = await fetch("/login", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    if (body.success) {
      this.props.dispatch({
        type: "login",
        user: this.state.user,
      });
      this.props.userAlertDone();
    } else {
      alert("This name is taken");
    }
  };

  render = () => {
    return (
      <div>
        <form onSubmit={this.submitHandler}>
          <label>What is your name</label>
          <input type="text" onChange={this.userName} />
          <input type="submit" />
        </form>
      </div>
    );
  };
}

export default connect()(UserAlert);
