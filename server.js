const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

const rooms = new Map();

wss.on("connection", (ws) => {
  let room = null;

  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    if (data.type === "join") {
      room = data.room;
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room).add(ws);
      return;
    }

    if (room && rooms.has(room)) {
      for (const client of rooms.get(room)) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      }
    }
  });

  ws.on("close", () => {
    if (room && rooms.has(room)) rooms.get(room).delete(ws);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("Server running on port " + PORT));