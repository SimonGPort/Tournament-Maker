import React, { Component } from "react";
import { connect } from "react-redux";
import Peer from "simple-peer";
import io from "socket.io-client";

const socket = io.connect("http://localhost:4002");

// let myStream = undefined;

class Rooms extends Component {
  constructor() {
    super();
    this.state = {
      myStream: undefined,
    };
  }

  async componentDidMount() {
    console.log("room mounted");
    socket.emit("roomMounted");
    socket.on("yourID", (id) => {
      console.log("yourID", id);
      socket.emit("yourID+name", { id: id, name: this.props.user });
      this.props.dispatch({
        type: "myID",
        myID: id,
      });
    });

    socket.on("personInTheRoom", (users) => {
      this.props.dispatch({
        type: "personInTheRoom",
        personInTheRoom: users,
      });
    });

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false,
      })
      .then((stream) => {
        this.setState({ myStream: stream });
        // myStream = stream;
        console.log("render");
        // let video = document.querySelector("video");
        // video.srcObject = stream;
        this.callPeer();
      });

    socket.on("callReceived", (data) => {
      console.log("callReceived", data);
      console.log("callReceived from:", data.from);
      const peer2 = new Peer({
        initiator: false,
        trickle: false,
        stream: this.state.myStream,
        // stream: myStream,
      });

      peer2.signal(data.signal);

      peer2.on("stream", (stream) => {
        console.log(this.state.myStream);
        // console.log(myStream);
        console.log("inside of stream:", stream);
        let video = document.querySelector("video");
        video.srcObject = stream;
        audio.srcObject = stream;
      });
      let to = data.from;
      peer2.on("signal", (data) => {
        socket.emit("acceptCall", { to: to, signal: data });
      });
    });
  }

  callPeer = () => {
    console.log("hello world2");
    this.props.personInTheRoom.forEach((person) => {
      if (person.name === this.props.user) {
        return;
      }
      console.log("after person");
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: this.state.myStream,
        // stream:myStream
      });
      console.log("before signal");
      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: person.id,
          signalData: data,
          from: this.props.myID,
        });
      });

      socket.on("callAccepted", (data) => {
        console.log("callAccepted yay");
        peer.signal(data);

        peer.on("stream", (stream) => {
          console.log(this.state.myStream);
          // console.log(myStream);
          console.log("inside of stream3 caller:", stream);
          let video = document.querySelector("video");
          video.srcObject = stream;
          audio.srcObject = stream;
        });
        console.log("finish for the caller", data);
      });
    });
  };

  render = () => {
    return (
      <div>
        Room 0{/* <audio autoPlay /> */}
        <video autoPlay />
      </div>
    );
  };
}

let mapStateToProps = (state) => {
  return {
    user: state.user,
    personInTheRoom: state.personInTheRoom,
    myID: state.myID,
  };
};

export default connect(mapStateToProps)(Rooms);
