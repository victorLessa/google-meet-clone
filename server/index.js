const server = require("http").createServer((request, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Hello World!");
  res.end();
});

const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "*",
    credentials: false,
  },
});

io.on("connection", (socket) => {
  console.log("connection", socket.id);
  socket.on("join-room", (roomId, userId) => {
    // adiciona os usuarios na mesma sala
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("disconnect", () => {
      console.log("disconnected!", roomId, userId);
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });

  socket.on("close-screen", (roomId, screenId) => {
    console.log("room: ", roomId, "screenId: ", screenId);
    socket.to(roomId).broadcast.emit("disconnected-screen", screenId);
  });
});

const startServer = () => {
  const { address, port } = server.address();
  console.info(`app running at ${address}:${port}`);
};

server.listen(process.env.PORT || 3000, startServer);
