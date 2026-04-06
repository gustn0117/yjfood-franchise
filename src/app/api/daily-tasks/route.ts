import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "daily-tasks.json");

export interface DailyTask {
  id: string;
  clientId: string;
  date: string;
  content: string;
  done: boolean;
  createdAt: string;
}

export function readTasks(): DailyTask[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeTasks(data: DailyTask[]) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const date = searchParams.get("date");
  let tasks = readTasks();
  if (clientId) tasks = tasks.filter((t) => t.clientId === clientId);
  if (date) tasks = tasks.filter((t) => t.date === date);
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { clientId, date, content } = body;
  if (!clientId || !content) return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });

  const task: DailyTask = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    clientId,
    date: date || new Date().toISOString().slice(0, 10),
    content,
    done: false,
    createdAt: new Date().toISOString(),
  };

  const tasks = readTasks();
  tasks.push(task);
  writeTasks(tasks);
  return NextResponse.json(task, { status: 201 });
}
