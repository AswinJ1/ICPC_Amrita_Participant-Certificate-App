import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import * as XLSX from "xlsx"

let cache: any[] | null = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 min cache

async function loadParticipants() {
  const now = Date.now()

  if (cache && now - cacheTime < CACHE_DURATION) {
    return cache
  }

  const filePath = path.resolve(process.cwd(), "data", "participants.csv")
  const fileBuffer = await fs.readFile(filePath, "utf-8")

  const workbook = XLSX.read(fileBuffer, { type: "string" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  cache = XLSX.utils.sheet_to_json(sheet)
  cacheTime = now

  return cache
}

export async function GET() {
  const participants = await loadParticipants()
  return NextResponse.json(participants)
}
