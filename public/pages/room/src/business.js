class Business {
  constructor({ room, media, view, socketBuilder, peerBuilder }) {
    this.room = room;
    this.media = media;
    this.view = view;

    this.socketBuilder = socketBuilder;
    this.peerBuilder = peerBuilder;

    this.socket = {};
    this.currentScreenShare = {};
    this.currentStream = {};
    this.currentPeer = {};

    this.peers = new Map();
    this.usersRecordings = new Map();
  }
  static initialize(deps) {
    const instance = new Business(deps);
    return instance._init();
  }

  async _init() {
    this.view.configureRecordButton(this.onRecordPressed.bind(this));
    this.view.configureLeaveButton(this.onLeavePressed.bind(this));
    this.view.configureMuteButton(this.onMutePressed.bind(this));
    this.view.configureScreenShareButton(this.onScreenSharePressed.bind(this));

    this.currentStream = await this.media.getCamera();
    this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.currentPeer = await this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallReceived(this.onPeerCallReceived())
      .setOnPeerStreamReceived(this.onPeerStreamReceived())
      .setOnCallError(this.onPeerCallError())
      .setOnCallClose(this.onPeerCallClose())
      .build();
    this.addVideoStream(this.currentPeer.id);
  }

  addVideoStream(userId, stream = this.currentStream, muted = true) {
    const recorderInstance = new Recorder(userId, stream);

    this.usersRecordings.set(recorderInstance.filename, recorderInstance);

    if (this.recordingEnabled) {
      recorderInstance.startRecording();
    }

    const isCurrentId = false;
    console.log(muted);
    this.view.renderVideo({
      userId,
      stream,
      isCurrentId,
      muted,
    });
  }

  onUserConnected() {
    return (userId) => {
      console.log("user connected!", userId, this.currentStream);
      this.currentPeer.call(userId, this.currentStream);
      this.currentPeer.call(userId, this.currentScreenShare);
    };
  }

  onUserDisconnected() {
    return (userId) => {
      if (this.peers.has(userId)) {
        this.peers.get(userId).call.close();
        this.peers.delete(userId);
      }

      this.view.setParticipants(this.peers.size);
      this.stopRecording(userId);
      this.view.removeVideoElement(userId);
      console.log("user disconnected!", userId);
    };
  }

  onPeerError() {
    return (error) => {
      console.error("error on peer!", error);
    };
  }

  onPeerConnectionOpened() {
    return (peer) => {
      const id = peer.id;
      console.log("peer!!", peer);
      this.socket.emit("join-room", this.room, id);
    };
  }

  onPeerCallReceived() {
    return (call) => {
      console.log("answering call", call);

      call.answer(this.currentStream);
    };
  }

  onPeerStreamReceived() {
    return (call, stream) => {
      const callerId = call.peer;

      if (!this.peers.has(stream.id)) {
        this.addVideoStream(callerId, stream, false);
        this.peers.set(callerId, { call });
        this.peers.set(stream.id, { call });

        this.view.setParticipants(this.peers.size);
      }
    };
  }

  onPeerCallError() {
    return (call, error) => {
      console.log("on call error", error, call.peer);
      this.view.removeVideoElement(call.peer);
    };
  }

  onPeerCallClose() {
    return (call) => {
      console.log("on call close", call.peer);
      this.view.removeVideoElement(call.peer);
    };
  }

  onRecordPressed(recordingEnabled) {
    this.recordingEnabled = recordingEnabled;
    console.log("pressed", recordingEnabled);
    for (const [key, value] of this.usersRecordings) {
      if (this.recordingEnabled) {
        value.startRecording();
        continue;
      }
      this.stopRecording(key);
    }
  }

  async stopRecording(userId) {
    const usersRecordings = this.usersRecordings;
    for (const [key, value] of usersRecordings) {
      const isContextUser = key.includes(userId);
      if (!isContextUser) continue;

      const rec = value;
      const isRecordingActive = rec.recordingActive;
      if (!isRecordingActive) continue;
      console.log("stoppp");
      await rec.stopRecording();

      this.playRecordings(key);
    }
  }

  playRecordings(userId) {
    const user = this.usersRecordings.get(userId);
    const videoUrl = user.getAllVideosUrls();

    console.log("==v", videoUrl);
    videoUrl.map((url) => {
      this.view.renderVideo({ url, userId });
    });
  }

  onLeavePressed() {
    this.usersRecordings.forEach((value, key) => value.download());
  }

  onMutePressed() {
    console.log("mute audio", this.currentStream);

    this.currentStream.getAudioTracks().forEach((t) => {
      if (t.kind == "audio") {
        console.log(t);
        t.enabled = !t.enabled;
      }
    });
  }

  async onScreenSharePressed() {
    this.currentScreenShare = await this.media.getScreen();

    const isCurrentId = false;
    this.view.renderVideo({
      userId: this.currentPeer.id,
      stream: this.currentScreenShare,
      isCurrentId,
    });

    for (const [key, _] of this.peers) {
      console.log(key);

      this.currentPeer.call(key, this.currentScreenShare);
    }
  }
}
