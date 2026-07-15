export type UserRole = "admin" | "tutor" | "student";

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  tutor: "/tutor",
  student: "/student",
};

export function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "tutor" || value === "student";
}
