"use client"

import { useEffect, useState, useCallback } from "react"
import { initializeSocket } from "@/lib/socket"
import type { Socket } from "socket.io-client"

interface Message {
  id: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  timestamp: Date
  isEdited: boolean
}

interface UseSocketMessagesReturn {
  messages: Message[]
  isConnected: boolean
  sendMessage: (chatId: string, content: string) => void
  clearMessages: () => void
}

export function useSocketMessages(chatId: string, currentUserId: string): UseSocketMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const sock = initializeSocket()
    setSocket(sock)

    sock.on("connect", () => {
      setIsConnected(true)
      console.log("[v0] Socket connected, joining room:", chatId)
      sock.emit("join_room", { chatId, userId: currentUserId })
    })

    sock.on("disconnect", () => {
      setIsConnected(false)
      console.log("[v0] Socket disconnected")
    })

    sock.on("receive_message", (data) => {
      console.log("[v0] Received message:", data)
      const newMessage: Message = {
        id: data.id,
        sender: {
          id: data.senderId,
          name: data.senderName,
          avatar: data.senderAvatar,
        },
        content: data.content,
        timestamp: new Date(data.timestamp),
        isEdited: data.isEdited || false,
      }
      setMessages((prev) => [...prev, newMessage])
    })

    sock.on("message_history", (data) => {
      console.log("[v0] Received message history:", data)
      const mappedMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg._id,
        sender: {
          id: msg.sender._id,
          name: msg.sender.name,
          avatar: msg.sender.avatar,
        },
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        isEdited: msg.isEdited,
      }))
      setMessages(mappedMessages)
    })

    sock.on("user_typing", (data) => {
      console.log("[v0] User typing:", data.userName)
    })

    return () => {
      if (sock) {
        sock.emit("leave_room", { chatId })
      }
    }
  }, [chatId, currentUserId])

  const sendMessage = useCallback(
    (roomId: string, content: string) => {
      if (socket && isConnected) {
        console.log("[v0] Sending message to room:", roomId)
        socket.emit("send_message", {
          chatId: roomId,
          content,
          senderId: currentUserId,
        })
      } else {
        console.error("[v0] Socket not connected, message not sent")
      }
    },
    [socket, isConnected, currentUserId],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isConnected, sendMessage, clearMessages }
}
