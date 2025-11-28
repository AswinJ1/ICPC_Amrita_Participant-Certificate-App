import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  // Use email field since it's the unique identifier
  const admin = await prisma.admin.findUnique({ where: { email: username } })

  if (!admin) {
    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, admin.password)
  if (!valid) {
    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true, data: { username: admin.name, role: "admin" } })
  response.cookies.set("admin-session", admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return response
}