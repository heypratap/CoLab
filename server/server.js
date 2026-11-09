
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CoLab backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "CoLab server is healthy",
  });
});


io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
  
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room: ${roomId}`);
    });
  
    socket.on("send-message", ({ roomId, message }) => {
      io.to(roomId).emit("receive-message", {
        message,
        senderId: socket.id,
      });
    });
  
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
  

server.listen(PORT, () => {
  console.log(`CoLab server running on port ${PORT}`);
});
