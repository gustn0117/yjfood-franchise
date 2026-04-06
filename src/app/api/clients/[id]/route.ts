import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { Client } from "../route";

const DATA_FILE = path.join(process.cwd(), "data", "clients.json");

function readClients(): Client[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeClients(data: Client[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const clients = readClients();
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  clients[idx] = { ...clients[idx], ...body };
  writeClients(clients);
  return NextResponse.json(clients[idx]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const clients = readClients();
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  writeClients(filtered);
  return NextResponse.json({ success: true });
}
