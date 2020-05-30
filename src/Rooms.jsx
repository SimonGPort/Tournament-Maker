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
    this.shareType = React.createRef();
    this.shareType.current = "camera";
    this.shareAudio = React.createRef();
    this.shareAudio.current = true;
    this.state = {
      peersVideos: [],
    };
  }

  async componentDidMount() {
    socket.on("disconnected", (id) => {
      console.log(
        "disconnecter:",
        id,
        "+",
        this.myPeersInfo.current,
        this.state.peersVideos
      );
      //Detruire l'element HTML
      let videoHtmlToDestroy = document.getElementById(id);
      videoHtmlToDestroy.remove();
      ///Detruire le peer
      let peerObjectToDestroy = this.myPeersInfo.current.find((peerObject) => {
        return peerObject.forThePeerId === id;
      });
      peerObjectToDestroy.peer.destroy();
      this.myPeersInfo.current = this.myPeersInfo.current.filter(
        (peerObject) => {
          return peerObject.forThePeerId !== id;
        }
      );
      console.log("this.myPeersInfo.current:", this.myPeersInfo.current);
      //Detruire la reference du stream dans le localState
      let peersVideos = this.state.peersVideos;
      peersVideos = peersVideos.filter((peerVideo) => {
        return peerVideo.from !== id;
      });
      this.setState({ peersVideos: peersVideos });
      console.log("thisState.peersVideos:", this.state.peersVideos);
    });

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
        audio: this.props.audio,
      })
      .then((stream) => {
        this.myStream.current = stream;
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
      if (barrier) {
        return;
      }

      let idNumber = Math.floor(Math.random() * 1000000);
      if (!data.from) {
        return;
      }
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
        console.log("stream-CallReveicer");
        let newVideo = undefined;
        let newVideoContainer = undefined;
        let newId = "video:" + data.from + "";
        if (!data.changeSignal) {
          newVideo = document.createElement("video");
          newVideoContainer = document.createElement("div");
          let videoCollection = document.getElementById("videoCollection");
          videoCollection.appendChild(newVideoContainer);
          newVideoContainer.appendChild(newVideo);
          newVideoContainer.id = "videoContainer:" + data.from;
          newVideo.setAttribute("id", newId);
          newVideo.setAttribute("class", "video");
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

      if (Barrier) {
        return;
      }

      let peerObject = this.myPeersInfo.current.find((peerObject) => {
        return peerObject.forThePeerId === data.from;
      });

      let peer = peerObject.peer;
      peer.signal(data.signal);
      peer.on("stream", (stream) => {
        console.log("stream-callAccepted");
        let streamBarrier = undefined;
        streamBarrier = this.state.peersVideos.find((peerVideo) => {
          return peerVideo.from === data.from;
        });

        if (streamBarrier) {
          return;
        }

        console.log("streaming callAccepted");

        let newVideo = undefined;
        let newVideoContainer = undefined;
        let newVideoControls = undefined;
        let newId = "video:" + data.from + "";
        if (!data.changeSignal) {
          newVideo = document.createElement("video");
          newVideoContainer = document.createElement("div");
          newVideoControls = document.createElement("div");
          let videoCollection = document.getElementById("videoCollection");
          videoCollection.appendChild(newVideoContainer);
          newVideoContainer.appendChild(newVideo);
          newVideoContainer.appendChild(newVideoControls);
          newVideoControls.id = "videoControls:" + data.from;
          newVideoContainer.id = "videoContainer:" + data.from;
          newVideo.setAttribute("id", newId);
          newVideo.setAttribute("class", "video");
          newVideo.setAttribute("autoPlay", true);
          newVideo.setAttribute("controls", true);
          ///videoControls
          let buttonFullScreen = undefined;
          buttonFullScreen = document.createElement("button");
          newVideoControls.appendChild(buttonFullScreen);
          buttonFullScreen.id = "videoControls-fullScreen:" + data.from;
          buttonFullScreen.onclick = () => {
            this.fullScreen(data.from);
          };
        } else {
          newVideo = document.getElementById(newId);
        }
        newVideo.srcObject = stream;

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

    socket.on("askContactToDestroyPeer-toReceiver", (data) => {
      this.myPeersInfo.current = this.myPeersInfo.current.filter((peer) => {
        return peer.forThePeerId !== data.from;
      });
      let peersVideos = this.state.peersVideos.filter((video) => {
        return video.from !== data.from;
      });
      this.setState({ peersVideos: peersVideos });

      console.log("myPeersinfo:", this.myPeersInfo.current);
      socket.emit("askContactToDestroyPeer-Return-toServer", {
        to: data.from,
        from: this.props.myID,
      });
    });

    socket.on("askContactToDestroyPeer-Return-toCaller", (data) => {
      let peerObjectToDestroy = this.myPeersInfo.current.find((peerObject) => {
        return peerObject.forThePeerId === data.from;
      });

      peerObjectToDestroy.peer.destroy();

      this.myPeersInfo.current = this.myPeersInfo.current.filter((peer) => {
        return peer.forThePeerId !== data.from;
      });

      let peersVideos = this.state.peersVideos.filter((video) => {
        return video.from !== data.from;
      });
      this.setState({ peersVideos: peersVideos });

      this.changePeerSignal(data.from);
    });
  }

  async componentDidUpdate() {
    if (
      this.props.share !== this.shareType.current ||
      this.props.audio !== this.shareAudio.current
    ) {
      let currentPeersInfo = this.myPeersInfo.current;

      if (this.props.share === "computer") {
        navigator.mediaDevices
          .getDisplayMedia({
            video: true,
            audio: this.props.audio,
          })
          .then((stream) => {
            this.myStream.current = stream;

            let myVideo = document.getElementById("myVideo");
            myVideo.srcObject = stream;
            currentPeersInfo.forEach((peerObject) => {
              socket.emit("askContactToDestroyPeer-toServer", {
                to: peerObject.forThePeerId,
                from: this.props.myID,
              });
            });
            this.shareType.current = this.props.share;
            this.shareAudio.current = this.props.audio;
          });
      } else {
        navigator.mediaDevices
          .getUserMedia({
            video: true,
            audio: this.props.audio,
          })
          .then((stream) => {
            this.myStream.current = stream;
            let myVideo = document.getElementById("myVideo");
            myVideo.srcObject = stream;
            currentPeersInfo.forEach((peerObject) => {
              socket.emit("askContactToDestroyPeer-toServer", {
                to: peerObject.forThePeerId,
                from: this.props.myID,
              });
            });
            this.shareType.current = this.props.share;
            this.shareAudio.current = this.props.audio;
          });
      }
    }
  }

  fullScreen = (id) => {
    let videoContainer = undefined;
    videoContainer = document.getElementById("video:" + id);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainer.requestFullscreen();
    }
    console.log("hello world", id);
  };

  callPeer = () => {
    let idNumber = Math.floor(Math.random() * 1000000);
    console.log("callPeer");
    this.props.personInTheRoom.forEach((person) => {
      if (person.name === this.props.user) {
        return;
      }
      if (!person.id) {
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

  changePeerSignal = (receiverId) => {
    let idNumber = Math.floor(Math.random() * 1000000);

    let peer = new Peer({
      initiator: true,
      trickle: false,
      stream: this.myStream.current,
    });
    this.myPeersInfo.current.push({
      peer,
      forThePeerId: receiverId,
      id: idNumber,
    });
    peer = this.myPeersInfo.current.slice(-1).pop().peer;

    peer.on("signal", (data) => {
      console.log("change signal");
      socket.emit("callUser", {
        userToCall: receiverId,
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
        {/* <div className="video-container"> */}

        {/* <div className="controls-video">
            <img src="/Pictures/fullscreen.svg" className="fullscreen" />
          </div> */}
        {/* </div> */}
        <div id={"videoCollection"}>
          <video autoPlay controls muted id={"myVideo"} className="video" />
        </div>
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
    audio: state.audio,
  };
};

export default connect(mapStateToProps)(Rooms);
