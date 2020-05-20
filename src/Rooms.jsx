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
    socket.emit("roomMounted");
    socket.on("yourID", (id) => {
      socket.emit("yourID+name", { id: id, name: this.props.user });
      this.props.dispatch({
        type: "myID",
        myID: id,
      });
    });

    socket.on("personInTheRoom", (users) => {
      console.log("personInTheRoom");
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
        console.log("stream promise finish");
        //je travail ici
        let myVideo = document.getElementById("myVideo");
        myVideo.srcObject = stream;
        this.callPeer();
      });

    socket.on("callReceived", (data) => {
      console.log("callReceived");
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
      peer.signal(data.signal);

      peer.on("stream", (stream) => {
        let newVideo = document.createElement("video");
        let videoCollection = document.getElementById("videoCollection");
        let newId = data.from + "";
        newVideo.setAttribute("id", newId);
        newVideo.srcObject = stream;
        newVideo.setAttribute("autoPlay", true);
        newVideo.setAttribute("controls", true);
        // newVideo.setAttribute("children", {
        //   controlBar: { children: { fullscreenToggle: false } },
        // });
        videoCollection.appendChild(newVideo);
        let newPeersVideos = this.state.peersVideos;
        newPeersVideos.push({
          stream,
          from: data.from,
        });
        this.setState({
          peersVideos: newPeersVideos,
        });
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
      let peerObject = this.myVideosForThePeers.current.find((peerObject) => {
        return peerObject.forThePeerId === data.from;
      });
      let peer = peerObject.peer;
      peer.signal(data.signal);
      peer.on("stream", (stream) => {
        let streamBarrier = undefined;
        streamBarrier = this.state.peersVideos.find((peerVideo) => {
          return peerVideo.from === data.from;
        });

        if (streamBarrier) {
          return;
        }

        console.log("streaming callAccepted");
        let newVideo = document.createElement("video");
        let videoCollection = document.getElementById("videoCollection");
        let newId = data.from + "";
        newVideo.setAttribute("id", newId);
        newVideo.srcObject = stream;
        newVideo.setAttribute("autoPlay", true);
        newVideo.setAttribute("controls", true);
        videoCollection.appendChild(newVideo);

        let newPeersVideos = this.state.peersVideos;
        newPeersVideos.push({
          stream,
          from: data.from,
        });
        this.setState({
          peersVideos: newPeersVideos,
        });
        // this.peersVideos.current.push({ stream, from: data.from });
        // let video = document.querySelector("video");
        // video.srcObject = stream;
        // audio.srcObject = stream;
      });
    });
  }

  callPeer = () => {
    console.log("callPeer");
    this.props.personInTheRoom.forEach((person) => {
      if (person.name === this.props.user) {
        return;
      }
      let peer = new Peer({
        initiator: true,
        trickle: false,
        stream: this.myStream.current,
      });
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
        <video autoPlay controls id={"myVideo"} />
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
