"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  isOnline?: boolean
}

interface UserProfileModalProps {
  user: UserProfile
  isEditing?: boolean
  onSave?: (profile: UserProfile) => void
  onClose: () => void
}

export function UserProfileModal({ user, isEditing = false, onSave, onClose }: UserProfileModalProps) {
  const [editing, setEditing] = useState(isEditing)
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || "",
    avatar: user.avatar || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...user,
        ...formData,
      })
      setEditing(false)
    }
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>

          {editing ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  rows={3}
                  placeholder="Tell us about yourself"
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {user.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}

              {user.isOnline !== undefined && (
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${user.isOnline ? "bg-green-500" : "bg-gray-400"}`}></div>
                  <span className="text-sm text-muted-foreground">{user.isOnline ? "Online" : "Offline"}</span>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-4">
            {editing ? (
              <>
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setEditing(true)} className="flex-1">
                  Edit Profile
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Close
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
