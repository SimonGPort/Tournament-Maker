import React, { Component } from "react";
import { Route, BrowserRouter, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import MainPage from "./MainPage.jsx";
import UserAlert from "./UserAlert.jsx";
import { connect } from "react-redux";
import io from "socket.io-client";

const socket = io.connect("http://localhost:4000");

class App extends Component {
  constructor() {
    super();
    this.state = {
      userAlertDone: false,
    };
  }

  componentDidMount() {
    console.log("trying in chat Mounted");
    socket.emit("chatMounted");
    console.log("trying in chat Mounted after");
  }

  async componentWillUnmount() {
    if (this.state.user === undefined) {
      return;
    }
    let data = new FormData();
    data.append("user", this.props.user);
    let response = await fetch("/logout", { method: "POST", body: data });
    let body = await response.text();
    body = JSON.parse(body);
    if (body.success) {
      this.props.dispatch({
        type: "logout",
        user: this.state.user,
      });
      this.setState({ userAlertDone: true });
    } else {
      alert("error in logout");
    }
  }

  userAlertDone = () => {
    this.setState({
      userAlertDone: true,
    });
  };

  renderMainPage = () => {
    return (
      <>
        <MainPage />
      </>
    );
  };

  render = () => {
    if (this.state.userAlertDone === false) {
      return <UserAlert userAlertDone={this.userAlertDone} />;
    }

    return (
      <BrowserRouter>
        <div className="fullPage">
          <div className="fullPage-contrainer">
            <Navbar />
            <Route path="/" exact={true} render={this.renderMainPage} />
          </div>
        </div>
      </BrowserRouter>
    );
  };
}

let mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(App);
// export default connect()(App);
