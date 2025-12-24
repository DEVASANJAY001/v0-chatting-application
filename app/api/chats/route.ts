import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/db"
import Chat from "@/lib/models/Chat"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }

    await connectDB()

    const chats = await Chat.find({ participants: decoded.userId })
      .populate("participants", "_id name email avatar isOnline")
      .populate("lastMessage")
      .sort({ lastMessageTime: -1 })

    return NextResponse.json({ chats }, { status: 200 })
  } catch (error) {
    console.error("Fetch chats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }

    await connectDB()

    const { otherUserId, name } = await request.json()

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [decoded.userId, otherUserId] },
      isGroup: false,
    })

    if (chat) {
      return NextResponse.json({ chat }, { status: 200 })
    }

    // Create new chat
    chat = await Chat.create({
      participants: [decoded.userId, otherUserId],
      isGroup: false,
      name,
    })

    await chat.populate("participants", "_id name email avatar isOnline")

    return NextResponse.json({ message: "Chat created successfully", chat }, { status: 201 })
  } catch (error) {
    console.error("Create chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
