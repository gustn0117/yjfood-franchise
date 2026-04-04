import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Inquiry } from "../route";

const DATA_FILE = path.join(process.cwd(), "data", "inquiries.json");

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
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const inquiries = readInquiries();
  const idx = inquiries.findIndex((i) => i.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  inquiries[idx] = { ...inquiries[idx], ...body };
  writeInquiries(inquiries);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const inquiries = readInquiries();
  const filtered = inquiries.filter((i) => i.id !== id);
  if (filtered.length === inquiries.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  writeInquiries(filtered);
  return NextResponse.json({ success: true });
}
