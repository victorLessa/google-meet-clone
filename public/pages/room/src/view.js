class View {
  constructor() {
    this.recorderBtn = document.getElementById("record");
    this.leaveBtn = document.getElementById("leave");
    this.screenShareBtn = document.getElementById("screen_share");
    this.muteBtn = document.getElementById("mute");
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
      video.addEventListener("loadedmetadata", (_) => video.play());
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
    console.log("==render video", muted);
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
    div.append(video);
    const div2 = document.createElement("div");
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
    element.remove();
  }

  toogleRecordButtonColor(isActive) {
    this.recorderBtn.style.color = isActive ? "red" : "white";
  }

  toogleMuteButtonColor(isActive) {
    this.muteBtn.style.color = isActive ? "red" : "white";
  }

  configureRecordButton(command) {
    this.recorderBtn.addEventListener("click", this.onRecordClick(command));
  }

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
  configureScreenShareButton(command) {
    this.screenShareBtn.addEventListener("click", command);
  }

  configureMuteButton(command) {
    this.muteBtn.addEventListener("click", this.onMuteClick(command));
  }

  configureLeaveButton(command) {
    this.leaveBtn.addEventListener("click", this.onLeaveClick(command));
  }
}
