class SocketBuilder {
  constructor({ socketUrl }) {
    this.socketUrl = socketUrl;
    this.onUserConnected = () => {};
    this.onScreenShareConnected = () => {};
    this.onUserDisconnected = () => {};
  }
  setOnUserConnected(fn) {
    this.onUserConnected = fn;

    return this;
  }
  setOnUserDisconnected(fn) {
    this.onUserDisconnected = fn;
    return this;
  }

  setScreenShareConnected(fn) {
    this.onScreenShareConnected = fn;
    return this;
  }

  build() {
    const socket = io.connect(this.socketUrl, {
      withCredentials: false,
    });

    socket.on("user-connected", this.onUserConnected);
    socket.on("screen-connected", this.onScreenShareConnected);
    socket.on("user-disconnected", this.onUserDisconnected);

    return socket;
  }
}
