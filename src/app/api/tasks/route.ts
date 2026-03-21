import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks - List all tasks (optionally filter by companyId)
export async function GET(req: Request) {
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
  const body = await req.json();

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority || "medium",
      status: body.status || "todo",
      recurrence: body.recurrence || "none",
      dueDate: new Date(body.dueDate),
      companyId: body.companyId,
      userId: body.userId,
    },
    include: { observations: true, company: true },
  });

  return NextResponse.json(task);
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
