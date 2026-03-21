export interface WAStatus {
  status: "disconnected" | "connecting" | "connected" | "qr";
  qr: string | null;
}

export interface TaskCompletion {
  taskId: string;
  confirmedAt: string;
  viaWhatsApp: true;
}

export async function getWAStatus(): Promise<WAStatus> {
  const res = await fetch("/api/whatsapp");
  return res.json();
}

export async function connectWA(): Promise<WAStatus> {
  const res = await fetch("/api/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "connect" }),
  });
  return res.json();
}

export async function disconnectWA(): Promise<void> {
  await fetch("/api/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "disconnect" }),
  });
}

export async function sendWAMessage(phone: string, message: string): Promise<boolean> {
  const res = await fetch("/api/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "send", phone, message }),
  });
  const data = await res.json();
  return data.sent === true;
}

export async function sendWAReminder(params: {
  taskId: string;
  taskTitle: string;
  companyName: string;
  phone: string;
  message: string;
}): Promise<boolean> {
  const res = await fetch("/api/whatsapp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reminder", ...params }),
  });
  const data = await res.json();
  return data.sent === true;
}

export async function pollTaskCompletions(): Promise<TaskCompletion[]> {
  try {
    const res = await fetch("/api/whatsapp?action=completions");
    const data = await res.json();
    return data.completions || [];
  } catch {
    return [];
  }
}
