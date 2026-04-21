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
  getStatus: () => { status: ConnectionStatus; qr: string | null };
  getPendingConfirmations: () => PendingConfirmation[];
  consumeTaskCompletions: () => TaskCompletion[];
}

const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR || path.join(process.cwd(), ".whatsapp-auth");

let service: WhatsAppService | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

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
 * Returns false if:
 *  - creds.json is missing
 *  - creds.json is empty or not valid JSON
 *  - creds.json is smaller than a reasonable size (< 50 bytes = clearly truncated)
 */
function isSessionValid(): boolean {
  const credsPath = path.join(AUTH_DIR, "creds.json");

  if (!fs.existsSync(credsPath)) {
    console.log("[WA] No creds.json found – session is empty/new");
    return false;
  }

  try {
    const raw = fs.readFileSync(credsPath, "utf-8");

    // Clearly truncated / empty
    if (raw.length < 50) {
      console.warn("[WA] creds.json is too small – corrupt session");
      return false;
    }

    // Must be parseable JSON
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      console.warn("[WA] creds.json is not a valid object – corrupt session");
      return false;
    }

    // Must have at minimum the noise key
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
 * Uses sync operations with retries for locked files (common on Windows/Railway volumes).
 */
function forceDeleteAuthDir(): void {
  console.log(`[WA] Force-deleting auth dir: ${AUTH_DIR}`);

  if (!fs.existsSync(AUTH_DIR)) {
    console.log("[WA] Auth dir does not exist, nothing to delete");
    return;
  }

  // List contents for debugging
  try {
    const files = fs.readdirSync(AUTH_DIR);
    console.log(`[WA] Auth dir contains ${files.length} files:`, files.join(", "));
  } catch (e) {
    console.warn("[WA] Could not list auth dir:", e);
  }

  // Try up to 3 times (files might be locked briefly)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log(`[WA] Auth dir deleted successfully (attempt ${attempt})`);
      return;
    } catch (err) {
      console.warn(`[WA] Delete attempt ${attempt}/3 failed:`, err);
      if (attempt < 3) {
        // Small sync delay before retry – acceptable in cleanup path
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
      } catch { /* ignore individual failures */ }
    }
    try { fs.rmdirSync(AUTH_DIR); } catch { /* ignore */ }
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

function createService(): WhatsAppService {
  console.log(`[WA] Service created. AUTH_DIR = ${AUTH_DIR}`);

  const svc: WhatsAppService = {
    status: "disconnected",
    qrCode: null,
    socket: null,
    pendingConfirmations: [],
    taskCompletions: [],

    async connect() {
      if (svc.status === "connecting" || svc.status === "connected") return;
      svc.status = "connecting";
      svc.qrCode = null;

      console.log("[WA] Starting connection...");

      // --- Session health check ---
      if (fs.existsSync(AUTH_DIR) && !isSessionValid()) {
        console.warn("[WA] Corrupt session detected on connect – cleaning up");
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
            } else {
              reconnectAttempts++;
              console.log(`[WA] Connection closed (reason=${reason}). Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);

              if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
                svc.status = "connecting";
                setTimeout(() => svc.connect(), 3000);
              } else {
                // Max retries exceeded – session is likely corrupt, auto-clean
                console.warn("[WA] Max reconnect attempts exceeded – auto-cleaning corrupt session");
                forceDeleteAuthDir();
                svc.status = "disconnected";
                svc.qrCode = null;
                svc.socket = null;
                reconnectAttempts = 0;
              }
            }
          }

          if (connection === "open") {
            reconnectAttempts = 0;
            svc.status = "connected";
            svc.qrCode = null;
            console.log("[WA] Connected successfully!");
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
            const senderPhone = senderJid.replace("@s.whatsapp.net", "");

            // Check if this is a response to a pending confirmation
            const pending = svc.pendingConfirmations.find(
              (p) => p.status === "waiting" && cleanPhone(p.phone) === senderPhone
            );

            if (!pending) continue;

            const isYes = ["si", "sí", "yes", "listo", "hecho", "ok", "dale", "ya"].includes(text);
            const isNo = ["no", "aun no", "todavia no", "aún no", "todavía no", "despues", "después"].includes(text);

            if (isYes) {
              pending.status = "confirmed";

              // Queue task completion for frontend to consume
              svc.taskCompletions.push({
                taskId: pending.taskId,
                confirmedAt: new Date().toISOString(),
                viaWhatsApp: true,
              });

              // Reply confirmation with friendly template
              sock.sendMessage(senderJid, {
                text: getConfirmationText({ taskTitle: pending.taskTitle, companyName: pending.companyName, message: pending.message }),
              }).catch(() => {});

            } else if (isNo) {
              pending.status = "rejected";

              // Reply with friendly rejection template
              sock.sendMessage(senderJid, {
                text: getRejectionText({ taskTitle: pending.taskTitle, companyName: pending.companyName, message: pending.message }),
              }).catch(() => {});

              // Create new pending for next reminder cycle
              setTimeout(() => {
                svc.sendTaskReminder({
                  taskId: pending.taskId,
                  taskTitle: pending.taskTitle,
                  companyName: pending.companyName,
                  phone: pending.phone,
                  message: pending.message,
                }).catch(() => {});
              }, 180000); // Re-remind in 3 min
            }
          }
        });

        svc.socket = sock;
      } catch (err) {
        console.error("[WA] Fatal error during connect:", err);
        // If connect itself throws, the session is very likely corrupt
        console.warn("[WA] Cleaning session after fatal connect error");
        forceDeleteAuthDir();
        svc.status = "disconnected";
        svc.qrCode = null;
        svc.socket = null;
        reconnectAttempts = 0;
      }
    },

    async disconnect() {
      console.log("[WA] Disconnect requested");
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

      // Check if this is a follow-up (already reminded before)
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

        // Track pending confirmation
        svc.pendingConfirmations.push({
          id: confirmId,
          taskId: params.taskId,
          taskTitle: params.taskTitle,
          companyName: params.companyName,
          phone: params.phone,
          message: params.message,
          sentAt: new Date().toISOString(),
          status: "waiting",
        });

        return true;
      } catch (err) {
        console.error("Error sending reminder:", err);
        return false;
      }
    },

    getStatus() {
      return { status: svc.status, qr: svc.qrCode };
    },

    getPendingConfirmations() {
      return svc.pendingConfirmations;
    },

    // Frontend polls this to get task completions from WhatsApp responses
    consumeTaskCompletions(): TaskCompletion[] {
      const completions = [...svc.taskCompletions];
      svc.taskCompletions = [];
      return completions;
    },
  };

  return svc;
}

export function getWhatsAppService(): WhatsAppService {
  if (!service) {
    service = createService();
  }
  return service;
}
