import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "inquiries.json");

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  region: string;
  brands: string[];
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

function readInquiries(): Inquiry[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeInquiries(data: Inquiry[]) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const inquiries = readInquiries();
  return NextResponse.json(inquiries);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, phone, region, brands, type, message } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "이름과 연락처는 필수입니다." }, { status: 400 });
  }

  const inquiry: Inquiry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    phone,
    region: region || "",
    brands: brands || [],
    type: type || "",
    message: message || "",
    createdAt: new Date().toISOString(),
    read: false,
  };

  const inquiries = readInquiries();
  inquiries.unshift(inquiry);
  writeInquiries(inquiries);

  return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
}
