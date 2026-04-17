import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "assess_session";

export type SessionPayload = {
  uid: string;
  role: "TUTOR" | "ADMIN";
  name: string;
};

export type AttemptToken = {
  leadId: string;
  testId: string;
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signSession(payload: SessionPayload, expiresIn: SignOptions["expiresIn"] = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function signAttemptToken(payload: AttemptToken, expiresIn: SignOptions["expiresIn"] = "4h") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken<T = unknown>(token: string): T | null {
  try {
    return jwt.verify(token, SECRET) as T;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken<SessionPayload>(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const s = await requireSession();
  if (s.role !== "ADMIN") throw new Error("FORBIDDEN");
  return s;
}
