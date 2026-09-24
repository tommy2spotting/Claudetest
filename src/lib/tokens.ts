import { randomBytes } from "node:crypto";

/** Token del link privato: 24 byte casuali (192 bit), impossibile da indovinare. */
export function nuovoTokenPrivato(): string {
  return randomBytes(24).toString("base64url");
}

export function tokenValido(token: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(token);
}
