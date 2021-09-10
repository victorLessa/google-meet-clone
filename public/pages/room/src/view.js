class View {
  constructor() {
    // this.recorderBtn = document.getElementById("record");
    this.leaveBtn = document.getElementById("leave");
    this.screenShareBtn = document.getElementById("screen_share");
    this.muteBtn = document.getElementById("mute");
    this.videoBtn = document.getElementById("video");
  }
  createVideoElement({ muted = false, src, srcObject }) {
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = muted;
    video.src = src;
    video.srcObject = srcObject;

    if (src) {
      video.controls = true;
      video.loop = true;
      Util.sleep(200).then((_) => video.play());
    }

    if (srcObject) {
      video.addEventListener("loadedmetadata", (_) => video?.play());
    }

    return video;
  }

  renderVideo({
    userId,
    stream = null,
    url = null,
    isCurrentId = false,
    muted = true,
  }) {
    const video = this.createVideoElement({
      muted,
      src: url,
      srcObject: stream,
    });
    this.appendToHTMLTree(userId, video, isCurrentId);
  }

  appendToHTMLTree(userId, video, isCurrentId) {
    const div = document.createElement("div");
    div.id = userId;
    div.classList.add("wrapper");
    const divOverlay = document.createElement("div");
    divOverlay.classList.add("div-overlay");
    divOverlay.onclick = this.fullScreenBtn(userId);
    const iconOverlay = document.createElement("i");
    div.append(video);
    iconOverlay.classList.add("fas");
    iconOverlay.classList.add("fa-expand");
    divOverlay.append(iconOverlay);
    div.append(divOverlay);
    const div2 = document.createElement("span");
    div2.innerText = isCurrentId ? "" : userId;
    div.append(div2);
    const videoGrid = document.getElementById("video-grid");
    videoGrid.append(div);
  }

  setParticipants(count) {
    const myself = 1;
    const participants = document.getElementById("participants");
    participants.innerHTML = count + myself;
  }

  removeVideoElement(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
  }

  // toogleRecordButtonColor(isActive) {
  //   this.recorderBtn.style.color = isActive ? "red" : "white";
  // }

  toogleMuteButtonColor(isActive) {
    console.log(isActive, "muted");
    this.muteBtn.style.color = isActive ? "red" : "white";
  }

  // configureRecordButton(command) {
  //   this.recorderBtn.addEventListener("click", this.onRecordClick(command));
  // }

  onRecordClick(command) {
    this.recordingEnabled = false;
    return () => {
      const isActive = (this.recordingEnabled = !this.recordingEnabled);
      command(this.recordingEnabled);

      this.toogleRecordButtonColor(isActive);
    };
  }

  onMuteClick(command) {
    this.muteEnabled = false;
    return () => {
      const isActive = (this.muteEnabled = !this.muteEnabled);
      command(this.muteEnabled);

      this.toogleMuteButtonColor(isActive);
    };
  }

  onLeaveClick(command) {
    return async () => {
      command();

      await Util.sleep(4000);
      window.location = "/pages/home";
    };
  }

  onScreenShareClick(command) {
    this.screenShareEnable = false;
    return () => {
      const isActive = (this.screenShareEnable = !this.screenShareEnable);
      command(isActive);
      this.view.toogleButtonShareScreen(isActive);
    };
  }

  toogleButtonShareScreen(isActive) {
    this.screenShareBtn.style.color = isActive ? "red" : "white";
  }

  toogleButtonVideo(isActive) {
    this.videoBtn.style.color = isActive ? "red" : "white";
  }

  configureScreenShareButton(command) {
    this.screenShareBtn.addEventListener(
      "click",
      this.onScreenShareClick(command)
    );
  }

  configureMuteButton(command) {
    this.muteBtn.addEventListener("click", this.onMuteClick(command));
  }

  configureLeaveButton(command) {
    this.leaveBtn.addEventListener("click", this.onLeaveClick(command));
  }

  onVideoClick(command) {
    this.videoEnabled = false;
    return () => {
      const isActive = (this.videoEnabled = !this.videoEnabled);
      command(isActive);
      this.toogleButtonVideo(isActive);
    };
  }

  fullScreenBtn(userId) {
    this.enableFullScreen = false;
    return () => {
      const video = document.getElementById(userId);
      if (this.enableFullScreen) {
        video.classList.remove("video-full-screen");
      } else {
        video.classList.add("video-full-screen");
      }
      this.enableFullScreen = !this.enableFullScreen;
    };
  }

  configureVideoButton(command) {
    this.videoBtn.addEventListener("click", this.onVideoClick(command));
  }
}
