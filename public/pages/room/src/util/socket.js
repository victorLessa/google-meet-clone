class SocketBuilder {
  constructor({ socketUrl }) {
    this.socketUrl = socketUrl;
    this.onUserConnected = () => {};
    this.onScreenShareConnected = () => {};
    this.onUserDisconnected = () => {};
    this.onScreenDisconnected = () => {};
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

  setScreenDisconnected(fn) {
    this.onScreenDisconnected = fn;
    return this;
  }

  build() {
    const socket = io.connect(this.socketUrl, {
      withCredentials: false,
    });

    socket.on("user-connected", this.onUserConnected);
    socket.on("screen-connected", this.onScreenShareConnected);
    socket.on("user-disconnected", this.onUserDisconnected);
    socket.on("disconnected-screen", this.onScreenDisconnected);

    return socket;
  }
}
