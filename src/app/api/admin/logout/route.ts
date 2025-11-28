import { NextResponse } from "next/server"

export async function GET() {
  const res = NextResponse.json({ success: true, message: "Logged out" })

  // delete cookie
  res.cookies.set("admin_token", "", {
    path: "/",
    maxAge: 0
  })

  return res
}

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out" })

  // Delete the admin session cookie
  res.cookies.set("admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  })

  return res
}
