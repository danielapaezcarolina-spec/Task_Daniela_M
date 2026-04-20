import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/tasks - List all tasks (optionally filter by companyId)
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  const tasks = await prisma.task.findMany({
    where: companyId ? { companyId } : undefined,
    include: { observations: { orderBy: { date: "desc" } }, company: true },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(tasks);
}

// POST /api/tasks - Create a new task
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority || "medium",
      status: body.status || "todo",
      recurrence: body.recurrence || "none",
      weekDay: body.recurrence === "weekly_specific" && body.weekDay != null ? parseInt(body.weekDay) : null,
      dueDate: new Date(body.dueDate),
      ...(body.companyId ? { companyId: body.companyId } : {}),
      userId: session.userId,
    },
    include: { observations: true, company: true },
  });

  return NextResponse.json(task);
}

function getNextBusinessDay(from: Date): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function getNextWeekday(from: Date, targetDay: number): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  while (next.getDay() !== targetDay) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function getNextMonthSameDay(from: Date): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next;
}

function getNextDueDate(recurrence: string, currentDue: Date, weekDay?: number | null): Date {
  switch (recurrence) {
    case "daily":
      return getNextBusinessDay(currentDue);
    case "weekly":
      return getNextBusinessDay(new Date(currentDue.getTime() + 6 * 86400000));
    case "weekly_specific":
      return getNextWeekday(currentDue, weekDay ?? 1);
    case "monthly":
      return getNextMonthSameDay(currentDue);
    default:
      return currentDue;
  }
}

// PATCH /api/tasks - Update a task
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Handle observation if provided
  if (data.observation) {
    await prisma.taskObservation.create({
      data: {
        text: data.observation,
        status: data.status || "todo",
        taskId: id,
      },
    });
    delete data.observation;
  }

  // Convert date strings
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (data.completedAt) data.completedAt = new Date(data.completedAt);

  // Recurring task completed: move dueDate to next occurrence and reset to todo
  if (data.status === "done") {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (existing && existing.recurrence !== "none") {
      const nextDue = getNextDueDate(existing.recurrence, existing.dueDate, existing.weekDay);
      const task = await prisma.task.update({
        where: { id },
        data: {
          completedAt: new Date(),
          completionComment: data.completionComment,
          dueDate: nextDue,
          status: "todo",
        },
        include: { observations: { orderBy: { date: "desc" } }, company: true },
      });
      return NextResponse.json(task);
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: { observations: { orderBy: { date: "desc" } }, company: true },
  });

  return NextResponse.json(task);
}

// DELETE /api/tasks - Delete a task
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
