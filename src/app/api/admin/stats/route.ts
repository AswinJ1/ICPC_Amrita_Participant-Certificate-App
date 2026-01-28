import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { promises as fs } from "fs"
import path from "path"
import * as XLSX from "xlsx"

export async function GET(request: NextRequest) {
  try {
    // console.log("📊 Loading stats...");
    
    // Load all participants from CSV
    const filePath = path.resolve(process.cwd(), "data", "participants.csv");
    const fileBuffer = await fs.readFile(filePath, 'utf-8');
    const workbook = XLSX.read(fileBuffer, { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const allParticipants = XLSX.utils.sheet_to_json(sheet);
    // console.log("📋 Total participants in CSV:", allParticipants.length);

    // Get download counts
    const downloadCounts = await prisma.downloadCount.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // console.log("💾 Download records found:", downloadCounts.length);

    // Calculate stats correctly
    const totalParticipants = allParticipants.length;
    
    // Create a set of verified participants (unique by email + teamId)
    const verifiedSet = new Set();
    interface DownloadCount {
      email: string;
    }
    
    downloadCounts.forEach((dc: DownloadCount) => {
      verifiedSet.add(`${dc.email}`);
    });
    
    const verifiedParticipants = verifiedSet.size; // Unique verified participants
    const unverifiedParticipants = totalParticipants - verifiedParticipants;
    interface DownloadCountItem {
      count: number;
      email: string;
      createdAt: Date;
    }

    const totalDownloads: number = downloadCounts.reduce((sum: number, item: DownloadCountItem) => sum + item.count, 0);
    
    // Fix verification rate calculation
    const verificationRate = totalParticipants > 0 ? 
      Math.round((verifiedParticipants / totalParticipants) * 100) : 0;

    // console.log("📈 Stats calculated:", {
    //   totalParticipants,
    //   verifiedParticipants,
    //   unverifiedParticipants,
    //   totalDownloads,
    //   verificationRate,
    //   uniqueVerifiedCount: verifiedSet.size
    // });

    // Team-wise statistics - group by unique participants
    interface TeamStatsData {
      downloads: number;
      members: number;
      uniqueMembers: Set<string>;
    }
    
    const teamStats: { [teamName: string]: TeamStatsData } = {};
    const processedParticipants = new Set();

    interface DownloadItem {
      email: string;
      teamName: string;
      count: number;
    }

    interface ProcessedParticipant {
      email: string;
    }

    downloadCounts.forEach((item: DownloadItem) => {
      const participantKey: string = `${item.email}`;
      const teamName: string = item.teamName || 'Unknown Team';
      
      if (!teamStats[teamName]) {
        teamStats[teamName] = { downloads: 0, members: 0, uniqueMembers: new Set<string>() };
      }
      
      teamStats[teamName].downloads += item.count;
      
      // Count unique members per team
      if (!teamStats[teamName].uniqueMembers.has(participantKey)) {
        teamStats[teamName].uniqueMembers.add(participantKey);
        teamStats[teamName].members += 1;
      }
    });

    // Convert to arrays for charts
    const teamDownloads = Object.entries(teamStats)
      .map(([teamName, data]: [string, any]) => ({
        teamName: teamName.length > 15 ? teamName.substring(0, 15) + '...' : teamName,
        downloads: data.downloads,
        members: data.members
      }))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    // Generate daily trends
    let dailyTrends = [];
    
    if (downloadCounts.length > 0) {
      interface DailyTrendData {
        date: string;
        downloads: number;
        newUsers: number;
        uniqueUsers: Set<string>;
      }

      interface TrendsMap {
        [date: string]: DailyTrendData;
      }

      interface DownloadCountRecord {
        createdAt: Date;
        count: number;
        email: string;
      }

      const trendsMap: TrendsMap = downloadCounts.reduce((acc: TrendsMap, item: DownloadCountRecord) => {
        const date: string = new Date(item.createdAt).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, downloads: 0, newUsers: 0, uniqueUsers: new Set<string>() };
        }
        acc[date].downloads += item.count;
        
        const userKey: string = `${item.email}`;
        if (!acc[date].uniqueUsers.has(userKey)) {
          acc[date].uniqueUsers.add(userKey);
          acc[date].newUsers += 1;
        }
        
        return acc;
      }, {});

      dailyTrends = Object.entries(trendsMap)
        .map(([date, data]: [string, any]) => ({
          date,
          downloads: data.downloads,
          newUsers: data.newUsers
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      // Generate sample data for demo
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dailyTrends.push({
          date: date.toISOString().split('T')[0],
          downloads: Math.floor(Math.random() * 5),
          newUsers: Math.floor(Math.random() * 3)
        });
      }
    }

    const responseData = {
      totalParticipants,
      verifiedParticipants,
      unverifiedParticipants,
      totalDownloads,
      verificationRate,
      teamDownloads: teamDownloads.length > 0 ? teamDownloads : [
        { teamName: "No teams yet", downloads: 0, members: 0 }
      ],
      dailyTrends,
      summary: {
        total: totalParticipants,
        verified: verifiedParticipants,
        unverified: unverifiedParticipants,
        rate: verificationRate
      }
    };

    // console.log("✅ Final response:", {
    //   total: responseData.totalParticipants,
    //   verified: responseData.verifiedParticipants,
    //   unverified: responseData.unverifiedParticipants,
    //   rate: responseData.verificationRate
    // });

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("❌ Stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
