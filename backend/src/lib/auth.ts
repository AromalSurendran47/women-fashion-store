import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DEFAULT_SECRET = "aura-dev-secret-change-me-in-production";
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const TOKEN_TTL = "7d";

/** True when JWT_SECRET is not set in the environment (insecure fallback). */
export const usingDefaultSecret = !process.env.JWT_SECRET;

export interface AuthPayload {
  id: string;
  role: string;
}

/** Extend Express Request with the decoded auth payload. */
export interface AuthedRequest extends Request {
  auth?: AuthPayload;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function readToken(req: Request): AuthPayload | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

/** Require a valid token; 401 otherwise. */
export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const payload = readToken(req);
  if (!payload) return res.status(401).json({ error: "Authentication required" });
  req.auth = payload;
  next();
}

/** Require a valid admin token; 401/403 otherwise. */
export function adminRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const payload = readToken(req);
  if (!payload) return res.status(401).json({ error: "Authentication required" });
  if (payload.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  req.auth = payload;
  next();
}
