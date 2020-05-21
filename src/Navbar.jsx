import React, { Component } from "react";
import { connect } from "react-redux";

class Navbar extends Component {
  shareToggle = () => {
    this.props.dispatch({
      type: "shareToggle",
    });
  };

  audioToggle = () => {
    this.props.dispatch({
      type: "audioToggle",
    });
  };

  render = () => {
    return (
      <div>
        Navbar
        {this.props.share === "camera" ? (
          <button onClick={this.shareToggle}>
            <img src="/Pictures/screen_share.svg" />
          </button>
        ) : (
          <button onClick={this.shareToggle}>
            <img src="/Pictures/face.svg" />
          </button>
        )}
        {this.props.audio === true ? (
          <button onClick={this.audioToggle}>
            <img src="/Pictures/mic_off.svg" />
          </button>
        ) : (
          <button onClick={this.audioToggle}>
            <img src="/Pictures/mic.svg" />
          </button>
        )}
      </div>
    );
  };
}

let mapStateToProps = (state) => {
  return {
    share: state.share,
    audio: state.audio,
  };
};

export default connect(mapStateToProps)(Navbar);
