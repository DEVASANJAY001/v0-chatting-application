import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  return new Response("Socket.IO server", { status: 200 })
}
