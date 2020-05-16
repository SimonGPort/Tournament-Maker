import React, { Component } from "react";
import { connect } from "react-redux";
import Peer from "simple-peer";
import io from "socket.io-client";

const socket = io.connect("http://localhost:4002");

// let myStream = undefined;

class Rooms extends React.Component {
  constructor() {
    super();
    this.myVideosForThePeers = React.createRef();
    this.myVideosForThePeers.current = [];
    // this.peersVideos = React.createRef();
    // this.peersVideos.current = [];
    this.myStream = React.createRef();
    this.state = {
      peersVideos: [],
    };
  }

  async componentDidMount() {
    console.log("peersVideos", this.state.peersVideos);
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
        this.myStream.current = stream;

        console.log("render");
        this.callPeer();
      });

    socket.on("callReceived", (data) => {
      console.log("callReceived", data);
      console.log("callReceived from:", data.from);
      console.log("new peer2");
      let barrier = undefined;
      barrier = this.state.peersVideos.find((peerVideo) => {
        return peerVideo.from === data.from;
      });
      // barrier = this.peersVideos.current.find((peerVideo) => {
      //   return peerVideo.from === data.from;
      // });
      if (barrier) {
        return;
      }
      let peer = new Peer({
        initiator: false,
        trickle: false,
        stream: this.myStream.current,
      });
      console.log("peer2:", peer);
      peer.signal(data.signal);

      peer.on("stream", (stream) => {
        let newVideo = document.createElement("video");
        let videoCollection = document.getElementById("videoCollection");
        console.log("newVideo:", newVideo);
        let newId = data.from + "";
        console.log("newId:", newId);
        newVideo.setAttribute("id", newId);
        newVideo.srcObject = stream;
        newVideo.setAttribute("autoPlay", true);
        videoCollection.appendChild(newVideo);

        console.log("STREAM:", stream);
        console.log(this.myStream.current);
        console.log("inside of stream:", stream);
        let newPeersVideos = this.state.peersVideos;
        newPeersVideos.push({
          stream,
          from: data.from,
        });
        this.setState({
          peersVideos: newPeersVideos,
        });
        console.log("peervideos:", this.state.peersVideos);
        // this.peersVideos.current.push({ stream, from: data.from });
        // let video = document.querySelector("video");
        // video.srcObject = stream;
        // audio.srcObject = stream;
      });
      let to = data.from;
      peer.on("signal", (data) => {
        socket.emit("acceptCall", {
          to: to,
          signal: data,
          from: this.props.myID,
        });
      });
    });

    socket.on("callAccepted", (data) => {
      let barrier = undefined;
      barrier = this.state.peersVideos.find((peerVideo) => {
        return peerVideo.from === data.from;
      });

      // barrier = this.peersVideos.current.find((peerVideo) => {
      //   return peerVideo.from === data.from;
      // });
      if (barrier) {
        return;
      }

      console.log("callAccepted yay");
      let peerObject = this.myVideosForThePeers.current.find((peerObject) => {
        return peerObject.forThePeerId === data.from;
      });
      let peer = peerObject.peer;
      console.log("data.signal in callAccepted:", data.signal);
      peer.signal(data.signal);
      console.log("callAccepted before-stream");
      peer.on("stream", (stream) => {
        let newVideo = document.createElement("video");
        let videoCollection = document.getElementById("videoCollection");
        console.log("newVideo:", newVideo);
        let newId = data.from + "";
        console.log("newId:", newId);
        newVideo.setAttribute("id", newId);
        newVideo.srcObject = stream;
        newVideo.setAttribute("autoPlay", true);
        videoCollection.appendChild(newVideo);

        console.log(this.myStream.current);
        // console.log(myStream);
        console.log("inside of stream3 caller:", stream);
        let newPeersVideos = this.state.peersVideos;
        newPeersVideos.push({
          stream,
          from: data.from,
        });
        this.setState({
          peersVideos: newPeersVideos,
        });
        console.log("peervideos:", this.state.peersVideos);
        // this.peersVideos.current.push({ stream, from: data.from });
        // let video = document.querySelector("video");
        // video.srcObject = stream;
        // audio.srcObject = stream;
      });

      console.log("finish for the caller", data);
    });
  }

  callPeer = () => {
    console.log("callPeer");
    this.props.personInTheRoom.forEach((person) => {
      if (person.name === this.props.user) {
        return;
      }
      console.log("after person");
      let peer = new Peer({
        initiator: true,
        trickle: false,
        stream: this.myStream.current,
      });
      console.log("peer in callPeer:", person.id, "+", peer);
      console.log("before signal");
      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: person.id,
          signalData: data,
          from: this.props.myID,
        });
      });
      this.myVideosForThePeers.current.push({ peer, forThePeerId: person.id });
    });
  };

  render = () => {
    // if (this.props.personInTheRoom === undefined) {
    //   return <div>Loading ...</div>;
    // }
    return (
      <div>
        Room 0{/* <audio autoPlay /> */}
        <video autoPlay id={"myVideo"} />
        <div id={"videoCollection"}></div>
        {/* {this.state.peersVideos.map((peer) => {
          // let stream = JSON.parse(peer.stream);
          return (
            <>
              <video key={peer.from} src={peer.stream} />
            </> */}
        {/* ); })} */}
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
