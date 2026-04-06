import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "clients.json");

export interface Client {
  id: string;
  name: string;
  project: string;
  price: string;
  address: string;
  createdAt: string;
}

export function readClients(): Client[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeClients(data: Client[]) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  return NextResponse.json(readClients());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, project, price, address } = body;
  if (!name) return NextResponse.json({ error: "이름은 필수입니다." }, { status: 400 });

  const client: Client = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    project: project || "",
    price: price || "",
    address: address || "",
    createdAt: new Date().toISOString(),
  };

  const clients = readClients();
  clients.unshift(client);
  writeClients(clients);
  return NextResponse.json(client, { status: 201 });
}
