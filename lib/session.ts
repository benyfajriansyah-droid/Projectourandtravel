import { SignJWT, jwtVerify } from "jose";

export type Role = "ADMIN" | "FINANCE" | "SALES" | "OPERASIONAL";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-insecure-secret-change-me"
);

export const COOKIE_NAME = "session";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
