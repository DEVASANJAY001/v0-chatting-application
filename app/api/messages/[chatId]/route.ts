import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/db"
import Message from "@/lib/models/Message"
import Chat from "@/lib/models/Chat"

export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: string }

    await connectDB()

    // Check if user is participant in this chat
    const chat = await Chat.findById(params.chatId)
    if (!chat || !chat.participants.includes(decoded.userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const messages = await Message.find({ chat: params.chatId })
      .populate("sender", "_id name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Message.countDocuments({ chat: params.chatId })

    return NextResponse.json(
      {
        messages: messages.reverse(),
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Fetch messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
