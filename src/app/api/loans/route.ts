import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/loans
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const loans = await prisma.personalLoan.findMany({
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(loans);
}

// POST /api/loans
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const loan = await prisma.personalLoan.create({
    data: {
      borrower: body.borrower,
      phone: body.phone || null,
      concept: body.concept,
      amount: parseFloat(body.amount),
      currency: body.currency || "COP",
      loanDate: new Date(body.loanDate || new Date()),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: body.status || "pending",
      amountPaid: parseFloat(body.amountPaid || "0"),
      notes: body.notes || null,
      userId: session.userId,
    },
  });

  return NextResponse.json(loan);
}

// PATCH /api/loans
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (data.amount) data.amount = parseFloat(data.amount);
  if (data.amountPaid !== undefined) data.amountPaid = parseFloat(data.amountPaid);
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  if (data.loanDate) data.loanDate = new Date(data.loanDate);

  const loan = await prisma.personalLoan.update({
    where: { id },
    data,
  });

  return NextResponse.json(loan);
}

// DELETE /api/loans
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.personalLoan.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
