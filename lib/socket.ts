import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export function initializeSocket(): Socket {
  if (socket) {
    return socket
  }

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id)
  })

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected")
  })

  socket.on("error", (error) => {
    console.error("[Socket] Error:", error)
  })

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
