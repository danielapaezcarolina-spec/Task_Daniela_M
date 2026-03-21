import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, getSession, clearSession } from "@/lib/session";

// GET /api/auth - Check current session
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}

// POST /api/auth - Login with PIN
export async function POST(req: Request) {
  const { pin } = await req.json();

  if (!pin) {
    return NextResponse.json({ error: "PIN required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { pin },
  });

  if (!user) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }

  await createSession(user.id, user.name);

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
}

// DELETE /api/auth - Logout
export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
