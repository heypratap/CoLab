import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "./y-server.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  destroyUpgrade: false,
});

app.get("/", (req, res) => {
  res.send("CoLab server is running!");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "success", message: "Server is healthy" });
});

const usersInFiles = {};

const allProjects = {};

const userColors = [
  "#f87171", "#fb923c", "#fbbf24", "#34d399",
  "#38bdf8", "#818cf8", "#c084fc", "#f472b6"
];

function pickColor(index) {
  return userColors[index % userColors.length];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let activeFileRoom = null;
  let activeProjectRoom = null;

  socket.on("join-project", ({ projectId, username, projectData }) => {
    if (!projectId) return;

    if (activeProjectRoom) {
      socket.leave(activeProjectRoom);
    }

    activeProjectRoom = "project-" + projectId;
    socket.join(activeProjectRoom);
    console.log(username + " joined project: " + projectId);

    const existing = allProjects[projectId];

    if (projectData) {
      if (existing) {
        if (projectData.files && projectData.files.length > 0) {
          existing.name = projectData.name || existing.name;
          existing.files = projectData.files;
          existing.updatedAt = new Date().toISOString();
        }
      } else {
        allProjects[projectId] = {
          id: projectData.id || projectId,
          name: projectData.name || "My Project",
          files: projectData.files || [],
          createdAt: projectData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }

    if (allProjects[projectId]) {
      socket.emit("sync-project-data", allProjects[projectId]);
    }

    if (!existing || !existing.files || existing.files.length === 0) {
      socket.to(activeProjectRoom).emit("request-project-state", { projectId });
    }
  });

  socket.on("provide-project-state", ({ projectId, projectData }) => {
    if (projectId && projectData && projectData.files) {
      allProjects[projectId] = projectData;
      socket.to("project-" + projectId).emit("sync-project-data", projectData);
    }
  });

  socket.on("update-project-files", ({ projectId, files }) => {
    if (allProjects[projectId]) {
      allProjects[projectId].files = files;
      allProjects[projectId].updatedAt = new Date().toISOString();
    } else {
      allProjects[projectId] = {
        id: projectId,
        name: "My Project",
        files: files || [],
        updatedAt: new Date().toISOString(),
      };
    }

    socket.to("project-" + projectId).emit("project-files-updated", { projectId, files });
  });

  socket.on("join-file-room", ({ roomId, username }) => {
    if (activeFileRoom) {
      socket.leave(activeFileRoom);
      if (usersInFiles[activeFileRoom]) {
        delete usersInFiles[activeFileRoom][socket.id];
        const remaining = Object.values(usersInFiles[activeFileRoom]);
        io.to(activeFileRoom).emit("users-update", remaining);
        if (remaining.length === 0) {
          delete usersInFiles[activeFileRoom];
        }
      }
    }

    activeFileRoom = roomId;
    socket.join(roomId);

    if (!usersInFiles[roomId]) {
      usersInFiles[roomId] = {};
    }

    const count = Object.keys(usersInFiles[roomId]).length;
    usersInFiles[roomId][socket.id] = {
      id: socket.id,
      username: username || "Guest",
      color: pickColor(count),
    };

    const userList = Object.values(usersInFiles[roomId]);
    io.to(roomId).emit("users-update", userList);
  });

  socket.on("disconnect", () => {
    if (activeFileRoom && usersInFiles[activeFileRoom]) {
      delete usersInFiles[activeFileRoom][socket.id];
      const remaining = Object.values(usersInFiles[activeFileRoom]);
      io.to(activeFileRoom).emit("users-update", remaining);
      if (remaining.length === 0) {
        delete usersInFiles[activeFileRoom];
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  if (request.url && request.url.startsWith("/yjs")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
});

wss.on("connection", (ws, req) => {
  const raw = (req.url || "").replace(/^\/yjs\/?/, "").split("?")[0] || "default";
  let roomName = "default";
  try {
    roomName = decodeURIComponent(raw);
  } catch {
    roomName = raw;
  }
  setupWSConnection(ws, req, { docName: roomName });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
  console.log("Yjs WebSocket ready at /yjs");
});
