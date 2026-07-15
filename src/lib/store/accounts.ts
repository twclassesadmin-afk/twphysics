import { db, nextId } from "./db";
import { hashPassword } from "./password";
import { getTutor } from "./tutors";
import { getStudent } from "./students";
import type { Account, UserRole } from "./types";

export function resolveAccountFullName(account: Account): string {
  if (account.role === "admin") return "Admin User";
  if (account.role === "tutor") return getTutor(account.linkedId)?.fullName ?? account.email;
  return getStudent(account.linkedId)?.name ?? account.email;
}

export function verifyCredentials(email: string, password: string): Account | null {
  const normalized = email.trim().toLowerCase();
  const account = db.accounts.find((a) => a.email.toLowerCase() === normalized);
  if (!account) return null;
  return account.passwordHash === hashPassword(password) ? account : null;
}

export function getAccountByEmail(email: string): Account | undefined {
  return db.accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
}

export function getAccountByLinkedId(linkedId: string): Account | undefined {
  return db.accounts.find((a) => a.linkedId === linkedId);
}

export function createAccount(input: {
  email: string;
  password: string;
  role: UserRole;
  linkedId: string;
  mustChangePassword?: boolean;
}): Account {
  const account: Account = {
    id: nextId("acc"),
    email: input.email.trim().toLowerCase(),
    passwordHash: hashPassword(input.password),
    role: input.role,
    linkedId: input.linkedId,
    mustChangePassword: input.mustChangePassword ?? false,
  };
  db.accounts.push(account);
  return account;
}

export function setPassword(accountId: string, newPassword: string): void {
  const account = db.accounts.find((a) => a.id === accountId);
  if (!account) return;
  account.passwordHash = hashPassword(newPassword);
  account.mustChangePassword = false;
}

export function setPasswordByLinkedId(linkedId: string, newPassword: string): void {
  const account = getAccountByLinkedId(linkedId);
  if (!account) return;
  setPassword(account.id, newPassword);
}
