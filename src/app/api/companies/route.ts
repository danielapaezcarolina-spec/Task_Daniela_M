import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/companies
export async function GET() {
  const companies = await prisma.company.findMany({
    include: {
      _count: { select: { tasks: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = companies.map((c) => ({
    ...c,
    tasksTotal: c._count.tasks,
    tasksCompleted: c.tasks.filter((t) => t.status === "done").length,
    tasks: undefined,
    _count: undefined,
  }));

  return NextResponse.json(result);
}

// POST /api/companies
export async function POST(req: Request) {
  const body = await req.json();

  const company = await prisma.company.create({
    data: {
      name: body.name,
      rif: body.rif,
      phone: body.phone,
      contactName: body.contactName,
      sendDailySummary: body.sendDailySummary ?? true,
      userId: body.userId,
    },
  });

  return NextResponse.json(company);
}

// PATCH /api/companies
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const company = await prisma.company.update({
    where: { id },
    data,
  });

  return NextResponse.json(company);
}

// DELETE /api/companies
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
