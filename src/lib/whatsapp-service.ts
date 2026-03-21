import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import path from "path";
import fs from "fs";

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

const AUTH_DIR = path.join(process.cwd(), ".whatsapp-auth");

let service: WhatsAppService | null = null;

function cleanPhone(phone: string): string {
  return phone.replace(/[\s\-\+]/g, "");
}

function phoneToJid(phone: string): string {
  const cleaned = cleanPhone(phone);
  return cleaned.includes("@") ? cleaned : `${cleaned}@s.whatsapp.net`;
}

function createService(): WhatsAppService {
  const svc: WhatsAppService = {
    status: "disconnected",
    qrCode: null,
    socket: null,
    pendingConfirmations: [],
    taskCompletions: [],

    async connect() {
      if (svc.status === "connecting" || svc.status === "connected") return;
      svc.status = "connecting";

      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        browser: ["TaskConta", "Chrome", "1.0.0"],
      });

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          svc.qrCode = qr;
          svc.status = "qr";
        }

        if (connection === "close") {
          const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
          if (reason === DisconnectReason.loggedOut) {
            if (fs.existsSync(AUTH_DIR)) {
              fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            }
            svc.status = "disconnected";
            svc.qrCode = null;
            svc.socket = null;
          } else {
            svc.status = "disconnected";
            setTimeout(() => svc.connect(), 3000);
          }
        }

        if (connection === "open") {
          svc.status = "connected";
          svc.qrCode = null;
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

            // Reply confirmation
            sock.sendMessage(senderJid, {
              text: `Perfecto! Tarea "${pending.taskTitle}" marcada como completada.\n\nSeguimos con las demas tareas del dia!`,
            }).catch(() => {});

          } else if (isNo) {
            pending.status = "rejected";

            // Reply and re-add as pending (will remind again)
            sock.sendMessage(senderJid, {
              text: `Entendido. Te recordare de nuevo en unos minutos.\n\nTarea: ${pending.taskTitle}\nEmpresa: ${pending.companyName}`,
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
    },

    async disconnect() {
      if (svc.socket) {
        await svc.socket.logout();
        svc.socket = null;
      }
      svc.status = "disconnected";
      svc.qrCode = null;
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

      const text = [
        `TaskConta - Recordatorio`,
        ``,
        params.message,
        ``,
        `Tarea: ${params.taskTitle}`,
        `Empresa: ${params.companyName}`,
        ``,
        `Ya completaste esta tarea?`,
        `Responde "si" o "no"`,
      ].join("\n");

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
