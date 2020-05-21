import React, { Component } from "react";
import { connect } from "react-redux";
import Peer from "simple-peer";
import io from "socket.io-client";

const socket = io.connect("http://localhost:4002");

// let myStream = undefined;

class Rooms extends React.Component {
  constructor() {
    super();
    this.myPeersInfo = React.createRef();
    this.myPeersInfo.current = [];
    this.myStream = React.createRef();
    this.state = {
      peersVideos: [],
      shareType: "camera",
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
      if (barrier && !data.changeSignal) {
        return;
      }

      if (data.changeSignal) {
        this.myPeersInfo.current.filter((peerInfo) => {
          return peerInfo.forThePeerId !== data.from;
        });
      }
      let idNumber = Math.floor(Math.random() * 1000000);
      let peer = new Peer({
        initiator: false,
        trickle: false,
        stream: this.myStream.current,
      });
      this.myPeersInfo.current.push({
        peer,
        forThePeerId: data.from,
        id: idNumber,
      });

      peer = this.myPeersInfo.current.slice(-1).pop().peer;
      peer.signal(data.signal);
      peer.on("stream", (stream) => {
        let newVideo = undefined;
        let newId = data.from + "";
        if (!data.changeSignal) {
          newVideo = document.createElement("video");
          let videoCollection = document.getElementById("videoCollection");
          videoCollection.appendChild(newVideo);
          newVideo.setAttribute("id", newId);
          newVideo.setAttribute("autoPlay", true);
          newVideo.setAttribute("controls", true);
        } else {
          newVideo = document.getElementById(newId);
        }
        newVideo.srcObject = stream;

        let newPeersVideos = this.state.peersVideos;
        if (data.changeSignal) {
          newPeersVideos.filter((videoReceived) => {
            return videoReceived.from !== data.from;
          });
        }
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
      peer.on("signal", (dataSignal) => {
        socket.emit("acceptCall", {
          to: to,
          signal: dataSignal,
          from: this.props.myID,
          changeSignal: data.changeSignal,
          id: data.id,
        });
      });
    });

    socket.on("callAccepted", (data) => {
      console.log("callAccepted");
      let Barrier = undefined;
      Barrier = this.state.peersVideos.find((peerVideo) => {
        return peerVideo.from === data.from;
      });

      if (Barrier && !data.changeSignal) {
        return;
      }

      let peerObject = this.myPeersInfo.current.find((peerObject) => {
        return peerObject.forThePeerId === data.from;
      });
      // let peerObject = this.myPeersInfo.current.find((peerObject) => {
      //   return peerObject.forThePeerId === data.id;
      // });

      let peer = peerObject.peer;
      peer.signal(data.signal);
      peer.on("stream", (stream) => {
        console.log("stream callAccepted");
        let streamBarrier = undefined;
        streamBarrier = this.state.peersVideos.find((peerVideo) => {
          return peerVideo.from === data.from;
        });

        if (streamBarrier && !data.changeSignal) {
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

  async componentDidUpdate() {
    if (this.props.share !== this.state.shareType) {
      console.log("change in share");
      //je travail ici
      let currentPeersInfo = this.myPeersInfo.current;
      currentPeersInfo.forEach((peerObject) => {
        peerObject.peer.destroy();
        this.changePeerSignal(peerObject);
      });

      this.setState({ shareType: this.props.share });

      if (this.props.share === "computer") {
        navigator.mediaDevices
          .getDisplayMedia({
            video: true,
            audio: false,
          })
          .then((stream) => {
            this.myStream.current = stream;
            console.log("stream promise finish");
            let myVideo = document.getElementById("myVideo");
            myVideo.srcObject = stream;
          });
      } else {
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: false,
          })
          .then((stream) => {
            this.myStream.current = stream;
            console.log("stream promise finish");
            let myVideo = document.getElementById("myVideo");
            myVideo.srcObject = stream;
          });
      }
    }
  }

  callPeer = () => {
    let idNumber = Math.floor(Math.random() * 1000000);
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
      this.myPeersInfo.current.push({
        peer,
        forThePeerId: person.id,
        id: idNumber,
      });
      peer = this.myPeersInfo.current.slice(-1).pop().peer;
      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall: person.id,
          signalData: data,
          from: this.props.myID,
          changeSignal: false,
          id: idNumber,
        });
      });
    });
  };

  changePeerSignal = (peerObject) => {
    if (!peerObject.forThePeerId) {
      return;
    }
    this.myPeersInfo.current.filter((peerInfo) => {
      return peerInfo.forThePeerId !== peerObject.forThePeerId;
    });
    let idNumber = Math.floor(Math.random() * 1000000);
    let peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.myStream.current,
    });
    this.myPeersInfo.current.push({
      peer,
      forThePeerId: peerObject.forThePeerId,
      id: idNumber,
    });
    peer = this.myPeersInfo.current.slice(-1).pop().peer;

    peer.on("signal", (data) => {
      console.log("change signal");
      socket.emit("callUser", {
        userToCall: peerObject.forThePeerId,
        signalData: data,
        from: this.props.myID,
        changeSignal: true,
      });
    });
  };

  render = () => {
    // if (this.props.personInTheRoom === undefined) {
    //   return <div>Loading ...</div>;
    // }
    return (
      <div>
        <img src="/Pictures/fullscreen.svg" className="control-button " />
        Room 0{/* <audio autoPlay /> */}
        <div className="video-container">
          <video autoPlay controls id={"myVideo"} className="myVideo" />
          <div className="controls-video">
            <img src="/Pictures/fullscreen.svg" className="fullscreen" />
          </div>
        </div>
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
    share: state.share,
  };
};

export default connect(mapStateToProps)(Rooms);
