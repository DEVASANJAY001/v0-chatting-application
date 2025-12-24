"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SearchUser {
  _id: string
  name: string
  email: string
  avatar?: string
  isOnline?: boolean
}

interface UserSearchProps {
  onSelectUser: (userId: string, userName: string) => void
  onClose: () => void
}

export function UserSearch({ onSelectUser, onClose }: UserSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchUser[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery)
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.users)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Start New Chat</h2>

          <Input
            placeholder="Search users by name or email..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Searching...</p>}

            {results.length === 0 && !loading && query && (
              <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
            )}

            {results.map((user) => (
              <button
                key={user._id}
                onClick={() => onSelectUser(user._id, user.name)}
                className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors text-left"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {user.isOnline && <div className="h-2 w-2 bg-green-500 rounded-full"></div>}
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
