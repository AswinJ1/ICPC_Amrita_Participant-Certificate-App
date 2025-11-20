"use server"

import { promises as fs } from "fs"
import path from "path"
import { z } from "zod"
import { PDFDocument, rgb } from 'pdf-lib'
import * as XLSX from "xlsx"
import fontkit from '@pdf-lib/fontkit'
import { prisma } from './prisma'

// Cache for participants data
let participantsCache: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getParticipants(): Promise<any[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (participantsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log("Using cached participants data");
    return participantsCache;
  }
  
  // Load fresh data
  console.log("Loading participants from Excel");
  const filePath = path.resolve(process.cwd(), "data", "trainers.xlsx");
  const fileBuffer = await fs.readFile(filePath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  participantsCache = XLSX.utils.sheet_to_json(sheet);
  cacheTimestamp = now;
  
  return participantsCache;
}

const formSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  teamId: z.number().min(1, "Team ID is required"),
  email: z.string().email("Invalid email address"),

})

type ActionResponse = {
  success: boolean
  message?: string
  data?: string
}

export async function verifyAndGenerateCertificate(data: {
  name: string;
  teamId: number;
  email: string;
}): Promise<ActionResponse> {
  try {
    console.log("Verifying participant:", data);

    // Remove redundant file access checks - only check once
    const templatePath = path.resolve(process.cwd(), "public", "certificate-template.pdf");
    const fontPath = path.resolve(process.cwd(), 'public', 'fonts', 'Acumin-RPro.otf');

    // Verify participant using cached data
    const participantInfo = await verifyParticipant(
      data.name,
      data.teamId,
      data.email
    );
    
    if (!participantInfo) {
      return {
        success: false,
        message: "Participant details not found in registered participants list"
      };
    }

    // Read and modify PDF
    const [templateBytes, fontBytes] = await Promise.all([
      fs.readFile(templatePath),
      fs.readFile(fontPath)
    ]);

    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    
    // Proper case formatting for the name
    const formatName = (name: string) => {
      return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    const formattedName = formatName(data.name);
    
    // Dynamic font size calculation for name
    const maxNameWidth = width * 0.7;
    let nameFontSize = 28;
    let nameWidth = font.widthOfTextAtSize(formattedName, nameFontSize);
    
    while (nameWidth > maxNameWidth && nameFontSize > 20) {
      nameFontSize -= 1;
      nameWidth = font.widthOfTextAtSize(formattedName, nameFontSize);
    }
    
    const nameConfig = {
      text: formattedName,
      fontSize: nameFontSize,
      y: height * 0.57,
      xOffset: 0
    };

    // Team name configuration
    const teamNameConfig = {
      text: participantInfo.teamName,
      fontSize: 15,
      y: height * 0.51,
      xOffset: -74
    };

    const drawCenteredText = (config: { text: string, fontSize: number, y: number, xOffset?: number }) => {
      const textWidth = font.widthOfTextAtSize(config.text, config.fontSize);
      const x = (width - textWidth) / 2 + (config.xOffset || 0);
      
      page.drawText(config.text, {
        x,
        y: config.y,
        size: config.fontSize,
        font,
        color: rgb(0, 0, 0)
      });
    };

    drawCenteredText(nameConfig);
    drawCenteredText(teamNameConfig);

    const modifiedPdfBytes = await pdfDoc.save();
    const base64PDF = Buffer.from(modifiedPdfBytes).toString('base64');

    return {
      success: true,
      message: "Certificate generated successfully",
      data: base64PDF
    };

  } catch (error) {
    console.error("Certificate generation error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate certificate"
    };
  }
}

async function verifyParticipant(name: string, teamId: number, email: string): Promise<{ teamName: string } | null> {
  try {
    const participants = await getParticipants();
    
    const normalizeName = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizeEmail = (str: string) => str.trim().toLowerCase();
    
    const participant = participants.find((p: any) => {
      const matchName = normalizeName(p.Name?.toString() || '') === normalizeName(name);
      const matchEmail = normalizeEmail(p.email?.toString() || '') === normalizeEmail(email);
      const matchTeamId = parseInt(p.teamId?.toString() || '0') === teamId;
      
      // All three must match
      const isMatch = matchName && matchEmail && matchTeamId;
      
      if (isMatch) {
        console.log("✅ Participant verified:", { 
          name: p.Name, 
          email: p.email, 
          teamId: p.teamId,
          teamName: p.TeamName 
        });
      }
      
      return isMatch;
    });

    if (!participant) {
      console.log("❌ No matching participant found for:", { name, email, teamId });
      return null;
    }

    return {
      teamName: participant.TeamName?.toString() || 'Team'
    };
  } catch (error) {
    console.error("Error verifying participant:", error);
    return null;
  }
}