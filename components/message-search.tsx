"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SearchMessage {
  _id: string
  sender: {
    _id: string
    name: string
  }
  content: string
  createdAt: Date
}

interface MessageSearchProps {
  chatId: string
  onSelectMessage: (messageId: string, content: string) => void
  onClose: () => void
}

export function MessageSearch({ chatId, onSelectMessage, onClose }: MessageSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchMessage[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery)
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/messages/search?q=${encodeURIComponent(searchQuery)}&chatId=${chatId}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.messages)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    },
    [chatId],
  )

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl">
        <div className="p-6 space-y-4 max-h-96">
          <h2 className="text-lg font-semibold">Search Messages</h2>

          <Input
            placeholder="Search in this conversation..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>}

            {results.length === 0 && !loading && query && (
              <p className="text-sm text-muted-foreground text-center py-4">No messages found</p>
            )}

            {results.map((message) => (
              <button
                key={message._id}
                onClick={() => onSelectMessage(message._id, message.content)}
                className="w-full flex items-start gap-3 p-3 hover:bg-secondary rounded-lg transition-colors text-left border border-border"
              >
                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                  <AvatarFallback className="text-xs">{getInitials(message.sender.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{message.sender.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</p>
                  </div>
                  <p className="text-sm text-foreground truncate">{message.content}</p>
                </div>
              </button>
            ))}
          </div>

          <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
