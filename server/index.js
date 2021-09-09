const Events = require("./events");

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

  new Events(socket).build();
});

const startServer = () => {
  const { address, port } = server.address();
  console.info(`app running at ${address}:${port}`);
};

server.listen(process.env.PORT || 3000, startServer);
