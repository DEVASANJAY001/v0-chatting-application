import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { googleId, email, name, avatar } = await request.json()

    if (!googleId || !email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] })

    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        avatar: avatar || null,
      })
    } else if (!user.googleId) {
      // Link Google account to existing email user
      user.googleId = googleId
      user.avatar = avatar || user.avatar
      await user.save()
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    const response = NextResponse.json(
      {
        message: "Google login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      },
      { status: 200 },
    )

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
