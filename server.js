import express from "express"
import http from "http"
import { Server as SocketIOServer } from "socket.io"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/chatapp")

// Socket.IO event handlers
const userSockets = new Map()
const roomUsers = new Map()

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on("join_room", ({ chatId, userId }) => {
    socket.join(chatId)
    userSockets.set(userId, socket.id)

    if (!roomUsers.has(chatId)) {
      roomUsers.set(chatId, new Set())
    }
    roomUsers.get(chatId).add(userId)

    console.log(`User ${userId} joined room ${chatId}`)

    // Notify others in the room
    io.to(chatId).emit("user_joined", {
      userId,
      userCount: roomUsers.get(chatId).size,
    })
  })

  socket.on("send_message", async ({ chatId, content, senderId }) => {
    console.log(`Message in room ${chatId}: ${content}`)

    const messageData = {
      id: `msg_${Date.now()}`,
      chatId,
      content,
      senderId,
      senderName: "User", // This should come from database
      timestamp: new Date(),
      isEdited: false,
    }

    // Broadcast message to room
    io.to(chatId).emit("receive_message", messageData)
  })

  socket.on("user_typing", ({ chatId, userName }) => {
    socket.to(chatId).emit("user_typing", { userName })
  })

  socket.on("leave_room", ({ chatId }) => {
    socket.leave(chatId)
    console.log(`User left room ${chatId}`)
  })

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)
    // Clean up user socket mapping
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId)
      }
    }
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})
