// function toggleMute(id) {
//   let video = document.getElementById("video:" + id);
//   let muteImage = document.getElementById("mute:" + id);
//   if (!muteImage) {
//     return;
//   }
//   if (video.muted) {
//     video.muted = false;
//     muteImage.src = "/Pictures/volume_up.svg";
//   } else {
//     video.muted = true;
//     muteImage.src = "/Pictures/volume_off.svg";
//   }
// }

export default function createVideoControls(
  id,
  toggleMute,
  updateVolume,
  picture_in_picture,
  fullScreen
) {
  console.log("createVideoControls+id:", id);

  let videoControls = document.getElementById("videoControls:" + id);
  console.log("videoControls element:", videoControls);
  videoControls.className = "videoControls";
  let videoControlsLeft = undefined;
  let videoControlsRight = undefined;
  videoControlsLeft = document.createElement("div");
  videoControlsRight = document.createElement("div");
  videoControls.appendChild(videoControlsLeft);
  videoControls.appendChild(videoControlsRight);
  videoControlsLeft.className = "controls-left";
  videoControlsLeft.className = "controls-right";

  //Controls-left
  let buttonVolume = document.createElement("button");
  buttonVolume.className = "button-volume button";
  videoControlsLeft.appendChild(buttonVolume);
  let buttonMute = document.createElement("img");
  buttonMute.id = "mute:" + id;
  buttonMute.src = "/Pictures/volume_up.svg";
  buttonMute.onclick = function toggleVolume() {
    toggleMute(id);
  };
  buttonVolume.appendChild(buttonMute);
  let inputVolume = document.createElement("input");
  inputVolume.className = "volume";
  inputVolume.type = "range";
  inputVolume.max = "1";
  inputVolume.min = "0";
  inputVolume.step = "0.01";
  inputVolume.onchange = function updateVolumeInput(evt) {
    console.log("updateVolumeInput", evt);
    updateVolume(id, evt);
  };
  videoControlsLeft.appendChild(inputVolume);

  //controls-right
  let buttonPIP = document.createElement("button");
  buttonPIP.className = "button-PIP button";
  let buttonPIPImg = document.createElement("img");
  buttonPIPImg.src = "/Pictures/picture_in_picture.svg";
  buttonPIPImg.className = "img-button";
  buttonPIPImg.onclick = function toggleVolume() {
    picture_in_picture(id);
  };
  videoControlsRight.appendChild(buttonPIP);
  buttonPIP.appendChild(buttonPIPImg);
  //fullscreen
  let buttonFullscreen = document.createElement("button");
  buttonFullscreen.className = "button-fullscreen button";
  let buttonFullscreenImg = document.createElement("img");
  buttonFullscreenImg.src = "/Pictures/fullscreen.svg";
  buttonFullscreenImg.className = "img-button";
  buttonFullscreenImg.onclick = function fullScreenInput() {
    fullScreen(id);
  };
  videoControlsRight.appendChild(buttonFullscreen);
  buttonFullscreen.appendChild(buttonFullscreenImg);
}
