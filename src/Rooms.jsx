import React, { Component } from "react";
import { connect } from "react-redux";
import Peer from "simple-peer";
import io from "socket.io-client";

const socket = io.connect("http://localhost:4002");

// let myStream = undefined;

class Rooms extends React.Component {
  constructor() {
    super();
    this.streamRef = React.createRef();
    this.partnerVideoRef = React.createRef();
    this.state = {
      myStream: undefined,
      peer: undefined,
      peer2: undefined,
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
        this.streamRef.current = this.state.myStream;
        // myStream = stream;
        console.log("render");
        // let video = document.querySelector("video");
        // video.srcObject = this.state.myStream;
        // video.srcObject = this.streamRef.current;
        this.callPeer();
      });

    socket.on("callReceived", (data) => {
      console.log("callReceived", data);
      console.log("callReceived from:", data.from);
      console.log("Peer2 before:", this.state.peer2);
      if (this.state.peer2) {
        return;
      }
      console.log("new peer2");
      let peer2 = new Peer({
        initiator: false,
        trickle: false,
        stream: this.streamRef.current,
        // stream: myStream,
      });
      this.setState({ peer2: peer2 });
      console.log("peer2:", peer2);
      // try {
      peer2.signal(data.signal);

      peer2.on("stream", (stream) => {
        console.log(this.state.myStream);
        // console.log(myStream);
        this.partnerVideoRef.current = stream;
        console.log("inside of stream:", stream);
        let video = document.querySelector("video");
        video.srcObject = this.partnerVideoRef.current;
        // audio.srcObject = stream;
      });
      // } catch (err) {
      //   console.log("error receiver:", err);
      // }
      let to = data.from;
      peer2.on("signal", (data) => {
        socket.emit("acceptCall", { to: to, signal: data });
      });
    });
  }

  callPeer = () => {
    console.log("callPeer");
    this.props.personInTheRoom.forEach((person) => {
      if (person.name === this.props.user) {
        return;
      }
      console.log("after person");
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: this.streamRef.current,
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
        // try {
        peer.signal(data);
        peer.on("stream", (stream) => {
          console.log(this.state.myStream);
          // console.log(myStream);
          console.log("inside of stream3 caller:", stream);
          // this.partnerVideoRef.current = stream;
          let video = document.querySelector("video");
          // video.srcObject = this.partnerVideoRef.current;
          video.srcObject = stream;
          // audio.srcObject = stream;
        });
        // } catch (err) {
        //   console.log("error caller:", err);
        // }
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
