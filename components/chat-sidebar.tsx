"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserSearch } from "@/components/user-search"

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

interface ChatSidebarProps {
  chats: Chat[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
}

export function ChatSidebar({ chats, selectedChatId, onSelectChat, onNewChat }: ChatSidebarProps) {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserSearch, setShowUserSearch] = useState(false)

  const filteredChats = chats.filter((chat) =>
    (chat.name || chat.participants[0]?.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleSelectUser = async (userId: string, userName: string) => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: userId }),
      })

      if (response.ok) {
        const data = await response.json()
        onSelectChat(data.chat._id)
        setShowUserSearch(false)
      }
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }

  return (
    <>
      <div className="w-full sm:w-80 h-screen flex flex-col bg-card border-r border-border">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground mb-4">ChatHub</h1>
          <Button onClick={() => setShowUserSearch(true)} className="w-full" size="sm">
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {filteredChats.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                {searchQuery ? "No chats found" : "No chats yet. Start a new conversation!"}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const otherUser = chat.participants[0]
                const isSelected = chat.id === selectedChatId
                return (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${isSelected ? "bg-primary/10 border border-primary" : "hover:bg-secondary"}`}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(otherUser?.name || "U")}</AvatarFallback>
                      </Avatar>
                      {otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-card"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium truncate">{otherUser?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate">{chat.lastMessage || "No messages yet"}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(user?.name || "U")}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button onClick={() => logout()} variant="outline" size="sm" className="w-full">
            Logout
          </Button>
        </div>
      </div>

      {/* User Search Modal */}
      {showUserSearch && <UserSearch onSelectUser={handleSelectUser} onClose={() => setShowUserSearch(false)} />}
    </>
  )
}
