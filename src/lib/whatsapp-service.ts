import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import path from "path";
import fs from "fs";
import {
  getFirstReminderText,
  getFollowUpReminderText,
  getConfirmationText,
  getRejectionText,
} from "./wa-templates";
import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// Recurring-task helpers (mirror of tasks/route.ts)
// ---------------------------------------------------------------------------
function getNextBusinessDay(from: Date): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  while (next.getDay() === 0 || next.getDay() === 6) next.setDate(next.getDate() + 1);
  return next;
}
function getNextWeekday(from: Date, targetDay: number): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  while (next.getDay() !== targetDay) next.setDate(next.getDate() + 1);
  return next;
}
function getNextMonthSameDay(from: Date): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next;
}
function getNextDueDate(recurrence: string, currentDue: Date, weekDay?: number | null): Date {
  switch (recurrence) {
    case "daily": return getNextBusinessDay(currentDue);
    case "weekly": return getNextBusinessDay(new Date(currentDue.getTime() + 6 * 86400000));
    case "weekly_specific": return getNextWeekday(currentDue, weekDay ?? 1);
    case "monthly": return getNextMonthSameDay(currentDue);
    default: return currentDue;
  }
}

/**
 * Mark a task as done in the DB. For recurring tasks, advances dueDate and resets to "todo".
 * This is called directly from the WA message handler so it works even if the browser is closed.
 */
async function completeTaskInDB(taskId: string): Promise<boolean> {
  try {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) {
      console.warn(`[WA] completeTaskInDB: task ${taskId} not found`);
      return false;
    }

    if (existing.recurrence !== "none") {
      // Recurring: advance dueDate to next occurrence, reset to todo
      const nextDue = getNextDueDate(existing.recurrence, existing.dueDate, existing.weekDay);
      await prisma.task.update({
        where: { id: taskId },
        data: { completedAt: new Date(), dueDate: nextDue, status: "todo" },
      });
      console.log(`[WA] Recurring task ${taskId} completed → next due: ${nextDue.toISOString()}`);
    } else {
      // One-off: mark as done
      await prisma.task.update({
        where: { id: taskId },
        data: { completedAt: new Date(), status: "done" },
      });
      console.log(`[WA] Task ${taskId} marked as done`);
    }

    // Add an observation so the history reflects the WA confirmation
    await prisma.taskObservation.create({
      data: { text: "Completada via WhatsApp ✅", status: "done", taskId },
    });
    return true;
  } catch (err) {
    console.error(`[WA] Error completing task ${taskId} in DB:`, err);
    return false;
  }
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "qr";

// A pending confirmation: system asked Daniela "did you do X?" and waits for si/no
export interface PendingConfirmation {
  id: string;
  taskId: string;
  taskTitle: string;
  companyName: string;
  phone: string; // JID-cleaned phone
  message: string;
  sentAt: string;
  status: "waiting" | "confirmed" | "rejected";
}

// Task completion triggered by WhatsApp response
export interface TaskCompletion {
  taskId: string;
  confirmedAt: string;
  viaWhatsApp: true;
}

/**
 * Resolve a WhatsApp LID (Linked ID) to an MSISDN (phone number)
 * using Baileys' internal mapping files in the auth directory.
 */
function resolveLid(lid: string): string | null {
  const mappingPath = path.join(AUTH_DIR, `lid-mapping-${lid}_reverse.json`);
  if (fs.existsSync(mappingPath)) {
    try {
      const content = fs.readFileSync(mappingPath, "utf-8").trim();
      // Remove quotes if present
      return content.replace(/^"|"$/g, "");
    } catch {
      return null;
    }
  }
  return null;
}

interface WhatsAppService {
  status: ConnectionStatus;
  qrCode: string | null;
  socket: ReturnType<typeof makeWASocket> | null;
  pendingConfirmations: PendingConfirmation[];
  taskCompletions: TaskCompletion[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  resetSession: () => Promise<void>;
  sendMessage: (phone: string, message: string) => Promise<boolean>;
  sendTaskReminder: (params: {
    taskId: string;
    taskTitle: string;
    companyName: string;
    phone: string;
    message: string;
  }) => Promise<boolean>;
  cancelTaskReminders: (taskId: string) => void;
  getStatus: () => { status: ConnectionStatus; qr: string | null };
  getPendingConfirmations: () => PendingConfirmation[];
  consumeTaskCompletions: () => TaskCompletion[];
}

const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR || path.join(process.cwd(), ".whatsapp-auth");

let service: WhatsAppService | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-\+]/g, "");
}

function phoneToJid(phone: string): string {
  const cleaned = cleanPhone(phone);
  return cleaned.includes("@") ? cleaned : `${cleaned}@s.whatsapp.net`;
}

/**
 * Validate that the session directory contains usable auth files.
 */
function isSessionValid(): boolean {
  const credsPath = path.join(AUTH_DIR, "creds.json");

  if (!fs.existsSync(credsPath)) {
    console.log("[WA] No creds.json found – session is empty/new");
    return false;
  }

  try {
    const raw = fs.readFileSync(credsPath, "utf-8");

    if (raw.length < 50) {
      console.warn("[WA] creds.json is too small – corrupt session");
      return false;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      console.warn("[WA] creds.json is not a valid object – corrupt session");
      return false;
    }

    if (!parsed.noiseKey && !parsed.signedIdentityKey) {
      console.warn("[WA] creds.json is missing key fields – corrupt session");
      return false;
    }

    console.log("[WA] Session appears valid");
    return true;
  } catch (err) {
    console.warn("[WA] Failed to read/parse creds.json – corrupt session:", err);
    return false;
  }
}

/**
 * Force-delete the entire auth directory.
 */
function forceDeleteAuthDir(): void {
  console.log(`[WA] Force-deleting auth dir: ${AUTH_DIR}`);

  if (!fs.existsSync(AUTH_DIR)) {
    console.log("[WA] Auth dir does not exist, nothing to delete");
    return;
  }

  try {
    const files = fs.readdirSync(AUTH_DIR);
    console.log(`[WA] Auth dir contains ${files.length} files:`, files.join(", "));
  } catch (e) {
    console.warn("[WA] Could not list auth dir:", e);
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log(`[WA] Auth dir deleted successfully (attempt ${attempt})`);
      return;
    } catch (err) {
      console.warn(`[WA] Delete attempt ${attempt}/3 failed:`, err);
      if (attempt < 3) {
        const waitUntil = Date.now() + 500;
        while (Date.now() < waitUntil) { /* busy wait */ }
      }
    }
  }

  // Last resort: delete files individually
  console.warn("[WA] Falling back to individual file deletion");
  try {
    const files = fs.readdirSync(AUTH_DIR);
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(AUTH_DIR, file));
      } catch { /* ignore */ }
    }
    try { fs.rmdirSync(AUTH_DIR); } catch { /* ignore */ }
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

function createService(): WhatsAppService {
  console.log(`[WA] Service created. AUTH_DIR = ${AUTH_DIR}`);

  // Track whether a QR was shown during this connection cycle
  let qrWasShown = false;

  // Map taskId -> set of autoRepeat interval IDs so we can cancel them all on confirmation
  const taskRepeatTimers = new Map<string, Set<ReturnType<typeof setInterval>>>();

  const PENDING_PATH = path.join(AUTH_DIR, "pending-confirmations.json");

  function savePending(pendings: PendingConfirmation[]) {
    try {
      // Only save those that are still waiting (or recently changed to keep context)
      // Filter out old confirmed/rejected after 1 hour to keep file small
      const oneHourAgo = Date.now() - 3600000;
      const toSave = pendings.filter(p => 
        p.status === "waiting" || new Date(p.sentAt).getTime() > oneHourAgo
      );
      fs.writeFileSync(PENDING_PATH, JSON.stringify(toSave, null, 2));
    } catch (e) {
      console.warn("[WA] Error saving pending confirmations:", e);
    }
  }

  function loadPending(): PendingConfirmation[] {
    try {
      if (fs.existsSync(PENDING_PATH)) {
        const raw = fs.readFileSync(PENDING_PATH, "utf-8");
        const loaded = JSON.parse(raw) as PendingConfirmation[];
        console.log(`[WA] Loaded ${loaded.length} pending confirmations from disk`);
        return loaded;
      }
    } catch (e) {
      console.warn("[WA] Error loading pending confirmations:", e);
    }
    return [];
  }

  function registerTimer(taskId: string, timer: ReturnType<typeof setInterval>) {
    if (!taskRepeatTimers.has(taskId)) taskRepeatTimers.set(taskId, new Set());
    taskRepeatTimers.get(taskId)!.add(timer);
  }

  function cancelTimers(taskId: string) {
    const timers = taskRepeatTimers.get(taskId);
    if (timers) {
      timers.forEach((t) => clearInterval(t));
      taskRepeatTimers.delete(taskId);
    }
  }

  let autoReminderInterval: ReturnType<typeof setInterval> | null = null;
  let lastCheckedMinute = "";

  async function checkAutoReminders() {
    if (svc.status !== "connected" || !svc.socket) return;

    const now = new Date();
    const currentMinute = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    if (currentMinute === lastCheckedMinute) return;
    lastCheckedMinute = currentMinute;

    const dayOfWeek = now.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const todayStr = now.toISOString().split("T")[0];

    try {
      const tasks = await prisma.task.findMany({
        where: {
          autoReminder: true,
          autoReminderTime: currentMinute,
          status: { not: "done" },
        },
        include: { company: true },
      });

      for (const task of tasks) {
        if (!task.company?.phone) continue;

        const completedToday = task.completedAt?.toISOString().split("T")[0] === todayStr;
        if (completedToday) continue;

        let shouldRemind = false;
        switch (task.recurrence) {
          case "daily":
          case "weekly":
            shouldRemind = isWeekday;
            break;
          case "weekly_specific":
            shouldRemind = task.weekDay === dayOfWeek;
            break;
          case "monthly":
            shouldRemind = now.getDate() === task.dueDate.getDate();
            break;
          case "none":
            shouldRemind = task.dueDate.toISOString().split("T")[0] === todayStr;
            break;
        }

        if (!shouldRemind) continue;

        const alreadyPending = svc.pendingConfirmations.some(
          (p) => p.taskId === task.id && p.status === "waiting"
        );
        if (alreadyPending) continue;

        console.log(`[WA-AUTO] Sending auto-reminder for "${task.title}" to ${task.company.phone}`);
        svc.sendTaskReminder({
          taskId: task.id,
          taskTitle: task.title,
          companyName: task.company.name,
          phone: task.company.phone,
          message: task.description || task.title,
        }).catch((err) => {
          console.error(`[WA-AUTO] Error sending reminder for task ${task.id}:`, err);
        });
      }
    } catch {
      console.warn("[WA-AUTO] DB unreachable — will retry next minute");
      lastCheckedMinute = "";
    }
  }

  function startAutoReminderScheduler() {
    if (autoReminderInterval) return;
    console.log("[WA-AUTO] Starting auto-reminder scheduler");
    autoReminderInterval = setInterval(checkAutoReminders, 60_000);
    checkAutoReminders();
  }

  function stopAutoReminderScheduler() {
    if (autoReminderInterval) {
      clearInterval(autoReminderInterval);
      autoReminderInterval = null;
      lastCheckedMinute = "";
      console.log("[WA-AUTO] Stopped auto-reminder scheduler");
    }
  }

  const svc: WhatsAppService = {
    status: "disconnected",
    qrCode: null,
    socket: null,
    pendingConfirmations: loadPending(),
    taskCompletions: [],

    async connect() {
      if (svc.status === "connecting" || svc.status === "connected") return;
      svc.status = "connecting";
      svc.qrCode = null;
      reconnectAttempts = 0;
      qrWasShown = false;

      console.log("[WA] connect() called – starting connection...");
      await openSocket();
    },

    async disconnect() {
      console.log("[WA] Disconnect requested");
      stopAutoReminderScheduler();
      if (svc.socket) {
        try {
          await svc.socket.logout();
        } catch (err) {
          console.warn("[WA] Error during logout (will force close):", err);
          try { svc.socket.ws.close(); } catch { /* ignore */ }
        }
        svc.socket = null;
      }
      svc.status = "disconnected";
      svc.qrCode = null;
    },

    async resetSession() {
      console.log("[WA] Reset session requested");
      stopAutoReminderScheduler();

      // 1. Close socket without logout (don't try to talk to WA servers for corrupt sessions)
      if (svc.socket) {
        try {
          svc.socket.ws.close();
          console.log("[WA] WebSocket closed");
        } catch (err) {
          console.warn("[WA] Error closing WebSocket:", err);
        }
        svc.socket = null;
      }

      // 2. Force-delete all session files
      forceDeleteAuthDir();

      // 3. Reset state
      svc.status = "disconnected";
      svc.qrCode = null;
      svc.pendingConfirmations = [];
      svc.taskCompletions = [];
      reconnectAttempts = 0;
      qrWasShown = false;

      console.log("[WA] Session reset complete");
    },

    async sendMessage(phone: string, message: string): Promise<boolean> {
      if (!svc.socket || svc.status !== "connected") return false;
      try {
        await svc.socket.sendMessage(phoneToJid(phone), { text: message });
        return true;
      } catch (err) {
        console.error("Error sending WhatsApp message:", err);
        return false;
      }
    },

    async sendTaskReminder(params): Promise<boolean> {
      if (!svc.socket || svc.status !== "connected") return false;

      const confirmId = `conf-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const isFollowUp = svc.pendingConfirmations.some(
        (p) => p.taskId === params.taskId && (p.status === "rejected" || p.status === "waiting")
      );

      const templateParams = {
        taskTitle: params.taskTitle,
        companyName: params.companyName,
        message: params.message,
      };

      const text = isFollowUp
        ? getFollowUpReminderText(templateParams)
        : getFirstReminderText(templateParams);

      try {
        await svc.socket.sendMessage(phoneToJid(params.phone), { text });

        const pending: PendingConfirmation = {
          id: confirmId,
          taskId: params.taskId,
          taskTitle: params.taskTitle,
          companyName: params.companyName,
          phone: params.phone,
          message: params.message,
          sentAt: new Date().toISOString(),
          status: "waiting",
        };
        svc.pendingConfirmations.push(pending);
        savePending(svc.pendingConfirmations);

        // Auto-repeat: at +3min and +6min (2 follow-ups max = 3 total sends)
        // Timer is registered in taskRepeatTimers so it can be cancelled on "si"
        let repeatCount = 0;
        const autoRepeat = setInterval(() => {
          repeatCount++;
          // Stop if: max repeats reached, task already confirmed/rejected, or no socket
          if (repeatCount >= 2 || pending.status !== "waiting" || !svc.socket || svc.status !== "connected") {
            clearInterval(autoRepeat);
            taskRepeatTimers.get(params.taskId)?.delete(autoRepeat);
            return;
          }
          svc.socket.sendMessage(phoneToJid(params.phone), {
            text: getFollowUpReminderText(templateParams),
          }).catch(() => {});
        }, 180000);

        registerTimer(params.taskId, autoRepeat);

        return true;
      } catch (err) {
        console.error("Error sending reminder:", err);
        return false;
      }
    },

    cancelTaskReminders(taskId: string) {
      // Cancel all auto-repeat intervals for this task
      cancelTimers(taskId);
      // Mark all waiting confirmations as confirmed
      svc.pendingConfirmations
        .filter((p) => p.taskId === taskId && p.status === "waiting")
        .forEach((p) => { p.status = "confirmed"; });
      savePending(svc.pendingConfirmations);
    },

    getStatus() {
      return { status: svc.status, qr: svc.qrCode };
    },

    getPendingConfirmations() {
      return svc.pendingConfirmations;
    },

    consumeTaskCompletions(): TaskCompletion[] {
      const completions = [...svc.taskCompletions];
      svc.taskCompletions = [];
      return completions;
    },
  };

  // -------------------------------------------------------------------------
  // Internal: Open a new Baileys socket. Used for both first connect
  // and reconnect (bypasses the connect() guard).
  // -------------------------------------------------------------------------
  async function openSocket(): Promise<void> {
    console.log("[WA] openSocket() called");

    // Close any existing socket first
    if (svc.socket) {
      try { svc.socket.ws.close(); } catch { /* ignore */ }
      svc.socket = null;
    }

    // --- Session health check ---
    if (fs.existsSync(AUTH_DIR) && !isSessionValid()) {
      console.warn("[WA] Corrupt session detected – cleaning up");
      forceDeleteAuthDir();
    }

    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
      console.log("[WA] Created fresh auth directory");
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const { version } = await fetchLatestBaileysVersion();

      console.log(`[WA] Baileys version: ${version}. Creating socket...`);

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        browser: ["TaskConta", "Chrome", "1.0.0"],
      });

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        console.log("[WA] connection.update:", {
          connection,
          qr: qr ? "(QR received)" : null,
          statusCode: (lastDisconnect?.error as Boom)?.output?.statusCode,
        });

        if (qr) {
          svc.qrCode = qr;
          svc.status = "qr";
          qrWasShown = true;
        }

        if (connection === "close") {
          const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

          if (reason === DisconnectReason.loggedOut) {
            console.log("[WA] Logged out by user – clearing session");
            forceDeleteAuthDir();
            svc.status = "disconnected";
            svc.qrCode = null;
            svc.socket = null;
            reconnectAttempts = 0;
            qrWasShown = false;
          } else {
            reconnectAttempts++;
            console.log(`[WA] Connection closed (reason=${reason}). Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);

            if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
              svc.status = "connecting";
              // Call openSocket directly – NOT svc.connect() which has a guard
              setTimeout(() => openSocket(), 3000);
            } else {
              // Max retries exceeded
              if (!qrWasShown) {
                console.warn("[WA] Max reconnect attempts with no QR – auto-cleaning corrupt session");
                forceDeleteAuthDir();
              } else {
                console.warn("[WA] Max reconnect attempts after QR scan – keeping session, user should retry");
              }
              svc.status = "disconnected";
              svc.qrCode = null;
              svc.socket = null;
              reconnectAttempts = 0;
            }
          }
        }

        if (connection === "open") {
          reconnectAttempts = 0;
          svc.qrCode = null;
          qrWasShown = false;
          console.log("[WA] Connected — waiting for socket to stabilize...");
          setTimeout(() => {
            svc.status = "connected";
            console.log("[WA] Ready to send messages!");
            startAutoReminderScheduler();
          }, 3000);
        }
      });

      // Listen for incoming messages
      sock.ev.on("messages.upsert", (m) => {
        for (const msg of m.messages) {
          if (!msg.message || msg.key.fromMe) continue;

          const text = (
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            ""
          ).trim().toLowerCase();

          const senderJid = msg.key.remoteJid || "";
          const senderId = senderJid.split("@")[0].split(":")[0];
          
          // Try to resolve the identity: could be a phone number or a LID
          const resolvedPhone = resolveLid(senderId) || senderId;

          console.log(`[WA] Incoming message from ${senderId} (resolved: ${resolvedPhone}): "${text}"`);

          const pending = svc.pendingConfirmations.find(
            (p) => p.status === "waiting" && resolvedPhone.endsWith(cleanPhone(p.phone))
          );

          if (!pending) {
            console.log(`[WA] No pending confirmation waiting for ${resolvedPhone} (id: ${senderId})`);
            continue;
          }

          console.log(`[WA] Found pending confirmation for task: ${pending.taskTitle}`);

          const isYes = ["si", "sí", "yes", "listo", "hecho", "ok", "dale", "ya"].includes(text);
          const isNo = ["no", "aun no", "todavia no", "aún no", "todavía no", "despues", "después"].includes(text);

          if (isYes) {
            console.log(`[WA] User said YES for task ${pending.taskId}`);
            // Cancel ALL timers and pending confirmations for this task
            cancelTimers(pending.taskId);
            svc.pendingConfirmations
              .filter((p) => p.taskId === pending.taskId && p.status === "waiting")
              .forEach((p) => { p.status = "confirmed"; });
            savePending(svc.pendingConfirmations);

            // 1. Update DB directly — works even if the browser is closed
            completeTaskInDB(pending.taskId).then((ok) => {
              if (ok) {
                // 2. Push to taskCompletions so the frontend poller refreshes
                svc.taskCompletions.push({
                  taskId: pending.taskId,
                  confirmedAt: new Date().toISOString(),
                  viaWhatsApp: true,
                });

                // 3. Respond to Daniela
                const replyText = getConfirmationText({ taskTitle: pending.taskTitle, companyName: pending.companyName, message: pending.message });
                console.log(`[WA] Sending confirmation reply: "${replyText.split("\n")[0]}..."`);
                sock.sendMessage(senderJid, { text: replyText }).catch((err) => {
                  console.error("[WA] Error sending confirmation message:", err);
                });
              } else {
                console.warn(`[WA] Task ${pending.taskId} not found in DB — skipping confirmation reply`);
                sock.sendMessage(senderJid, { text: "Esa tarea ya no existe en el sistema. Puede que haya sido eliminada." }).catch(() => {});
              }
            }).catch((err) => {
              console.error(`[WA] Error updating DB for task ${pending.taskId}:`, err);
            });

          } else if (isNo) {
            console.log(`[WA] User said NO for task ${pending.taskId}`);
            pending.status = "rejected";
            savePending(svc.pendingConfirmations);

            const rejectionText = getRejectionText({ taskTitle: pending.taskTitle, companyName: pending.companyName, message: pending.message });
            sock.sendMessage(senderJid, { text: rejectionText }).catch(() => {});

            // Re-remind after 3 min (only if no other waiting pending exists for this task)
            const alreadyWaiting = svc.pendingConfirmations.some(
              (p) => p.taskId === pending.taskId && p.status === "waiting"
            );
            if (!alreadyWaiting) {
              setTimeout(() => {
                svc.sendTaskReminder({
                  taskId: pending.taskId,
                  taskTitle: pending.taskTitle,
                  companyName: pending.companyName,
                  phone: pending.phone,
                  message: pending.message,
                }).catch(() => {});
              }, 180000);
            }
          } else {
            console.log(`[WA] Text "${text}" did not match yes/no pattern`);
          }
        }
      });

      svc.socket = sock;
    } catch (err) {
      console.error("[WA] Fatal error during openSocket:", err);
      console.warn("[WA] Cleaning session after fatal connect error");
      forceDeleteAuthDir();
      svc.status = "disconnected";
      svc.qrCode = null;
      svc.socket = null;
      reconnectAttempts = 0;
    }
  }

  return svc;
}

export function getWhatsAppService(): WhatsAppService {
  if (!service) {
    service = createService();

    // Auto-connect if a saved session exists
    const credsPath = path.join(AUTH_DIR, "creds.json");
    if (fs.existsSync(credsPath)) {
      console.log("[WA] Saved session found — auto-connecting...");
      service.connect().catch((err) => {
        console.error("[WA] Auto-connect failed:", err);
      });
    } else {
      console.log("[WA] No saved session — waiting for manual connect");
    }
  }
  return service;
}
