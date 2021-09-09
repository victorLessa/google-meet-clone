module.exports = class Socket {
  constructor(socket) {
    this.socket = socket;
    const defaultFunction = () => {};
    this.JoinRoom = defaultFunction;
    this.closeScreen = defaultFunction;
  }

  onCloseScreen(fn) {
    this.closeScreen = fn;
    return this;
  }

  onJoinRoom(fn) {
    this.JoinRoom = fn;
    return this;
  }

  build() {
    this.socket.on("close-screen", this.closeScreen);
    this.socket.on("join-room", this.JoinRoom);

    return this.socket;
  }
};
