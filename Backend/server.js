import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import ticketRoutes from "./routes/ticket.js";
import userRoutes from "./routes/user.js";

import { serve } from "inngest/express";
import { inngest } from "./inngest/client.js";
import { onUserSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/tickets", ticketRoutes);
app.use("/api/auth", userRoutes);

/* ================= INNGEST ================= */

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated],
  })
);

/* ================= HTTP SERVER ================= */

const server = http.createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

global.io = io;

/* ================= SOCKET EVENTS ================= */

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", socket.id, reason);
  });
});

/* ================= DATABASE + SERVER START ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });