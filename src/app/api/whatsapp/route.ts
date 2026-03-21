import { NextResponse } from "next/server";
import { getWhatsAppService } from "@/lib/whatsapp-service";

// GET /api/whatsapp - Status, pending confirmations, and task completions
export async function GET(req: Request) {
  const wa = getWhatsAppService();
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (action === "completions") {
    // Consume and return task completions from WhatsApp responses
    const completions = wa.consumeTaskCompletions();
    return NextResponse.json({ completions });
  }

  if (action === "confirmations") {
    return NextResponse.json({ confirmations: wa.getPendingConfirmations() });
  }

  const { status, qr } = wa.getStatus();
  return NextResponse.json({ status, qr });
}

// POST /api/whatsapp - Actions: connect, disconnect, send, reminder
export async function POST(req: Request) {
  const wa = getWhatsAppService();
  const body = await req.json();

  switch (body.action) {
    case "connect": {
      await wa.connect();
      await new Promise((r) => setTimeout(r, 2000));
      const { status, qr } = wa.getStatus();
      return NextResponse.json({ status, qr });
    }

    case "disconnect": {
      await wa.disconnect();
      return NextResponse.json({ status: "disconnected" });
    }

    case "send": {
      const { phone, message } = body;
      if (!phone || !message) {
        return NextResponse.json({ error: "phone and message required" }, { status: 400 });
      }
      const sent = await wa.sendMessage(phone, message);
      return NextResponse.json({ sent });
    }

    case "reminder": {
      const { taskId, taskTitle, companyName, phone, message } = body;
      if (!taskId || !phone || !message) {
        return NextResponse.json({ error: "taskId, phone, and message required" }, { status: 400 });
      }
      const sent = await wa.sendTaskReminder({
        taskId,
        taskTitle: taskTitle || "",
        companyName: companyName || "",
        phone,
        message,
      });
      return NextResponse.json({ sent });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}
