import 'dotenv/config';
import http from 'http';
import express from 'express';
import responseTime from 'response-time';
import cors from 'cors';

import { Server } from 'socket.io';
import { initialize, emitMessageToRoom } from './utils/socket/socket.js';
import config from './config/index.js';
import { middleware } from './middileware/index.js';
import { handler as routesHandler } from './routes/routes.js';

const { application } = config;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.OCEAN_ADMIN_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// app.use(middleware.cors)
app.use(middleware.preventClickjacking);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseTime((req, res, time) => console.log(req.method, req.url, time.toFixed(2))));
app.use((error, req, res, next) => middleware.trackRequest(error, req, res, next));
app.use(middleware.logRequest);

routesHandler(app);
initialize(io);

io.on("connection", (socket) => {
  console.log(`==========${socket.id} connected========`);

  socket.on("join_room", ({ hitId, eventToBeListened }, callback) => {
    const room = `room_${hitId}`;
    console.log(`${hitId} joining room ${room}`);
    try {
      socket.join(room);
      console.log(`${hitId} joined room ${room}`);
      if (typeof callback === 'function') {
        callback(null, { success: true, message: `${hitId} joined room successfully` });
      }

      emitMessageToRoom(room, eventToBeListened, {
        hitId: hitId,
        for: eventToBeListened,
        result: {
          code: 200,
          message: `${hitId} successfully joined the room.`
        }
      });
    } catch (error) {
      console.log("Some error while joining the room:", error);
      if (typeof callback === 'function') {
        callback({ success: false, message: "Failed to join room", error: error.message });
      }

      emitMessageToRoom(room, eventToBeListened, {
        hitId: hitId,
        for: eventToBeListened,
        result: {
          code: 200,
          message: `${hitId} failed to join the room.`
        }
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`=========disconnected: ${socket.id}=========`);
  });
});

server.listen(application.port, () => {
  console.log(`Cupons server started at ${new Date().toLocaleString()}`);
  console.log(`PID: ${process.pid}.`);
  console.log(`HTTP Port: ${application.port}`);
});

server.timeout = 30000;
