"use client"

import { useState, useCallback } from "react"

interface Message {
  _id: string
  sender: {
    _id: string
    name: string
    avatar?: string
  }
  content: string
  createdAt: Date
  isEdited: boolean
}

interface Pagination {
  total: number
  pages: number
  currentPage: number
}

export function useMessageHistory(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    pages: 1,
    currentPage: 1,
  })
  const [loading, setLoading] = useState(false)

  const fetchMessages = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const response = await fetch(`/api/messages/${chatId}?page=${page}&limit=20`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error("Fetch history error:", error)
      } finally {
        setLoading(false)
      }
    },
    [chatId],
  )

  const searchMessages = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setMessages([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/messages/search?q=${encodeURIComponent(searchQuery)}&chatId=${chatId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages)
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    },
    [chatId],
  )

  return {
    messages,
    pagination,
    loading,
    fetchMessages,
    searchMessages,
  }
}
