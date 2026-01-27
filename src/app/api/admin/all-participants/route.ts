import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Load all participants from CSV
    console.log("Loading all participants from CSV and database...");
    
    const filePath = path.resolve(process.cwd(), "data", "participants.csv");
    const fileBuffer = await fs.readFile(filePath, 'utf-8');
    const workbook = XLSX.read(fileBuffer, { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const allParticipants = XLSX.utils.sheet_to_json(sheet);

    // Get download counts
    const downloadCounts = await prisma.downloadCount.findMany();
    console.log("Found download records:", downloadCounts.length);

    // Create a map for faster lookup
    const downloadMap = new Map();
    interface DownloadCount {
        email: string;
        teamId: string;
        count: number;
        createdAt: Date | null;
        updatedAt: Date | null;
    }

    downloadCounts.forEach((dc: DownloadCount) => {
        const key: string = `${dc.email.toLowerCase()}-${dc.teamId}`;
        downloadMap.set(key, dc);
    });

    // Merge data
    const participantsWithStatus = allParticipants.map((participant: any, index) => {
      const key = `${participant.email?.toLowerCase()}-${participant.teamId}`;
      const downloadInfo = downloadMap.get(key);
      
      return {
        id: `participant-${index}`, // Create unique ID
        name: participant.name || '',
        email: participant.email || '',
        teamId: participant.teamId?.toString() || '',
        teamName: participant.teamName || '',
        count: downloadInfo?.count || 0,
        createdAt: downloadInfo?.createdAt || null,
        updatedAt: downloadInfo?.updatedAt || null,
        isVerified: downloadInfo ? downloadInfo.count > 0 : false
      };
    });

    console.log("Participants with verification status:", participantsWithStatus.length);
    console.log("Verified participants:", participantsWithStatus.filter(p => p.isVerified).length);

    return NextResponse.json({
      success: true,
      data: participantsWithStatus
    });

  } catch (error) {
    console.error("All participants API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch all participants" },
      { status: 500 }
    );
  }
}