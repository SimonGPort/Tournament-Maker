import React, { Component } from "react";
import { connect } from "react-redux";
import Peer from "simple-peer";
import io from "socket.io-client";

const socket = io.connect("http://localhost:4002");

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
      console.log("hello world");
      console.log("yourID", id);
      socket.emit("yourID+name", { id: id, name: this.props.user });
      this.props.dispatch({
        type: "myID",
        myID: id,
      });
    });

    socket.on("callReceived", (data) => {
      console.log("callReceived", data);
      console.log("callReceived from:", data.from);
      const peer2 = new Peer({
        initiator: false,
        trickle: false,
        stream: this.state.myStream,
      });

      peer2.signal(data.signal);

      peer2.on("stream", (stream) => {
        console.log(this.state.myStream);
        console.log("inside of stream:", stream);
        let audio = document.querySelector("audio");
        audio.srcObject = stream;
        // audio.srcObject = this.state.myStream;
      });
      let to = data.from;
      peer2.on("signal", (data) => {
        socket.emit("acceptCall", { to: to, signal: data });
      });
    });

    socket.on("callAccepted", (data) => {
      console.log("callAccepted yay");
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: this.state.myStream,
      });
      // peer.signal(data);

      peer.on("stream", (stream) => {
        console.log(this.state.myStream);
        console.log("inside of stream3:", stream);
        let audio = document.querySelector("audio");
        audio.srcObject = stream;
        // audio.srcObject = this.state.myStream;
      });
      console.log("finish", data);
    });

    socket.on("personInTheRoom", (users) => {
      this.props.dispatch({
        type: "personInTheRoom",
        personInTheRoom: users,
      });
    });

    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then((stream) => {
        this.setState({ myStream: stream });

        // let video = document.querySelector("video");
        // video.srcObject = stream;

        this.props.personInTheRoom.forEach((person) => {
          if (person.name === this.props.user) {
            return;
          }

          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: this.state.myStream,
          });
          peer.on("signal", (data) => {
            socket.emit("callUser", {
              userToCall: person.id,
              signalData: data,
              from: this.props.myID,
            });
          });
        });
      });
  }

  render = () => {
    return (
      <div>
        Room 0
        <audio autoPlay />
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
