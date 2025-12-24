import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"

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

    const users = await User.find({
      $and: [
        {
          $or: [{ name: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }],
        },
        { _id: { $ne: decoded.userId } },
      ],
    }).select("_id name email avatar isOnline")

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
