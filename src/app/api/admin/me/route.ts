import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("admin-session")?.value

  if (!sessionId) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: sessionId },
      select: { id: true, name: true, email: true }
    })

    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      data: {
        username: admin.name,
        email: admin.email,
        role: "admin"
      }
    })
  } catch (error) {
    console.error("Error fetching admin:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}