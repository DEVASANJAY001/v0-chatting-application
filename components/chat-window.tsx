"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSocketMessages } from "@/lib/use-socket-messages"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ChatWindowProps {
  chatId: string
  otherUserName: string
  isLoading?: boolean
}

export function ChatWindow({ chatId, otherUserName, isLoading = false }: ChatWindowProps) {
  const { user } = useAuth()
  const [messageInput, setMessageInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const { messages, isConnected, sendMessage } = useSocketMessages(chatId, user?.id || "")

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(chatId, messageInput)
      setMessageInput("")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{otherUserName}</h2>
            <p className="text-sm text-muted-foreground">
              {isConnected ? (
                <span className="text-green-500">Connected</span>
              ) : (
                <span className="text-red-500">Disconnected</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isSender = message.sender.id === user?.id
              return (
                <div key={message.id} className={`flex gap-3 ${isSender ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}>
                    <p className="text-xs text-muted-foreground mb-1">
                      {message.sender.name}
                      {message.isEdited && " (edited)"}
                    </p>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        isSender ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-border bg-card">
        {!isConnected && <p className="text-xs text-destructive mb-2">Connection lost. Reconnecting...</p>}
        <div className="flex gap-3">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading || !isConnected}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !messageInput.trim() || !isConnected}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
