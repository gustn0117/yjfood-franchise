import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { DailyTask } from "../route";

const DATA_FILE = path.join(process.cwd(), "data", "daily-tasks.json");

function readTasks(): DailyTask[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeTasks(data: DailyTask[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  tasks[idx] = { ...tasks[idx], ...body };
  writeTasks(tasks);
  return NextResponse.json(tasks[idx]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tasks = readTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  writeTasks(filtered);
  return NextResponse.json({ success: true });
}
