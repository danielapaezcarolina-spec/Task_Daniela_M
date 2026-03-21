import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/accounts-receivable?companyId=xxx
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");

  const accounts = await prisma.accountReceivable.findMany({
    where: companyId ? { companyId } : undefined,
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(accounts);
}

// POST /api/accounts-receivable
export async function POST(req: Request) {
  const body = await req.json();

  const account = await prisma.accountReceivable.create({
    data: {
      client: body.client,
      concept: body.concept,
      amount: parseFloat(body.amount),
      currency: body.currency || "USD",
      issueDate: new Date(body.issueDate || new Date()),
      dueDate: new Date(body.dueDate),
      status: body.status || "pending",
      amountPaid: parseFloat(body.amountPaid || "0"),
      notes: body.notes,
      companyId: body.companyId,
    },
  });

  return NextResponse.json(account);
}

// PATCH /api/accounts-receivable
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (data.amount) data.amount = parseFloat(data.amount);
  if (data.amountPaid) data.amountPaid = parseFloat(data.amountPaid);
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (data.issueDate) data.issueDate = new Date(data.issueDate);

  const account = await prisma.accountReceivable.update({
    where: { id },
    data,
  });

  return NextResponse.json(account);
}

// DELETE /api/accounts-receivable
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.accountReceivable.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
