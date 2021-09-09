const Socket = require("./socket");
module.exports = class Events {
  constructor(socket) {
    this.socket = socket;
  }

  closeScreen() {
    return (roomId, screenId) => {
      console.log("room: ", roomId, "screenId: ", screenId);
      this.socket.to(roomId).broadcast.emit("disconnected-screen", screenId);
    };
  }

  joinRoom() {
    return (roomId, userId) => {
      // adiciona os usuarios na mesma sala
      this.socket.join(roomId);
      this.socket.to(roomId).broadcast.emit("user-connected", userId);
      this.socket.on("disconnect", () => {
        console.log("disconnected!", roomId, userId);
        this.socket.to(roomId).broadcast.emit("user-disconnected", userId);
      });
    };
  }

  build() {
    new Socket(this.socket)
      .onCloseScreen(this.closeScreen())
      .onJoinRoom(this.joinRoom())
      .build();
  }
};
