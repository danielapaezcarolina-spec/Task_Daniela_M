import { cookies } from "next/headers";

const COOKIE_NAME = "tc_session";
const SECRET = process.env.SESSION_SECRET || "taskconta-default-secret-change-me";

async function sign(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const sigB64 = Buffer.from(sig).toString("base64url");
  const payloadB64 = Buffer.from(payload).toString("base64url");
  return `${payloadB64}.${sigB64}`;
}

async function verify(token: string): Promise<string | null> {
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  const payload = Buffer.from(payloadB64, "base64url").toString();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sig = Buffer.from(sigB64, "base64url");
  const valid = await crypto.subtle.verify("HMAC", key, sig, encoder.encode(payload));
  return valid ? payload : null;
}

export async function createSession(userId: string, name: string): Promise<void> {
  const payload = JSON.stringify({ userId, name, createdAt: Date.now() });
  const token = await sign(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getSession(): Promise<{ userId: string; name: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verify(token);
  if (!payload) return null;

  try {
    const data = JSON.parse(payload);
    return { userId: data.userId, name: data.name };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
