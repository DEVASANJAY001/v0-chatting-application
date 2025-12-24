import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/db"
import Message from "@/lib/models/Message"
import Chat from "@/lib/models/Chat"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const chatId = searchParams.get("chatId")

    if (!query.trim()) {
      return NextResponse.json({ messages: [] }, { status: 200 })
    }

    // Build search filter
    const searchFilter: any = {
      content: { $regex: query, $options: "i" },
    }

    if (chatId) {
      // Check if user is participant
      const chat = await Chat.findById(chatId)
      if (!chat || !chat.participants.includes(decoded.userId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
      searchFilter.chat = chatId
    } else {
      // Search only in user's chats
      const userChats = await Chat.find({ participants: decoded.userId })
      const chatIds = userChats.map((c) => c._id)
      searchFilter.chat = { $in: chatIds }
    }

    const messages = await Message.find(searchFilter)
      .populate("sender", "_id name avatar")
      .populate("chat", "_id")
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
