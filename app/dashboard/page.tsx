"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatWindow } from "@/components/chat-window"

interface Chat {
  id: string
  name?: string
  participants: Array<{
    id: string
    name: string
    avatar?: string
    isOnline: boolean
  }>
  lastMessage?: string
  lastMessageTime?: Date
}

interface Message {
  id: string
  sender: {
    id: string
    name: string
  }
  content: string
  timestamp: Date
  isEdited: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Mock data for demonstration
  useEffect(() => {
    setChats([
      {
        id: "1",
        participants: [{ id: "user2", name: "Creative Director", isOnline: true }],
        lastMessage: "Great work on the slides!",
        lastMessageTime: new Date(),
      },
      {
        id: "2",
        participants: [{ id: "user3", name: "Product Manager", isOnline: false }],
        lastMessage: "Let's discuss the project",
        lastMessageTime: new Date(Date.now() - 3600000),
      },
    ])
    if (chats.length > 0) {
      setSelectedChatId(chats[0].id)
    }
  }, [])

  // Mock messages
  useEffect(() => {
    if (selectedChatId) {
      setMessages([
        {
          id: "m1",
          sender: { id: "user2", name: "Creative Director" },
          content: "Hey! Are you here?",
          timestamp: new Date(Date.now() - 3600000),
          isEdited: false,
        },
        {
          id: "m2",
          sender: { id: user?.id || "", name: user?.name || "You" },
          content: "Yeah... Working on the slides",
          timestamp: new Date(Date.now() - 3000000),
          isEdited: false,
        },
        {
          id: "m3",
          sender: { id: "user2", name: "Creative Director" },
          content: "Great work on the slides! Love it!",
          timestamp: new Date(Date.now() - 1800000),
          isEdited: false,
        },
      ])
    }
  }, [selectedChatId, user?.id, user?.name])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const selectedChat = chats.find((c) => c.id === selectedChatId)

  const handleSendMessage = (content: string) => {
    if (user && selectedChat) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: {
          id: user.id,
          name: user.name,
        },
        content,
        timestamp: new Date(),
        isEdited: false,
      }
      setMessages((prev) => [...prev, newMessage])
    }
  }

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onNewChat={() => console.log("New chat")}
      />
      {selectedChat ? (
        <ChatWindow
          chatId={selectedChat.id}
          otherUserName={selectedChat.participants[0]?.name || "Unknown"}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  )
}
