import React, { Component } from "react";
import { connect } from "react-redux";

class Navbar extends Component {
  shareToggle = () => {
    this.props.dispatch({
      type: "shareToggle",
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
        <button>
          <img src="/Pictures/mic_off.svg" />
        </button>
      </div>
    );
  };
}

let mapStateToProps = (state) => {
  return {
    share: state.share,
  };
};

export default connect(mapStateToProps)(Navbar);
