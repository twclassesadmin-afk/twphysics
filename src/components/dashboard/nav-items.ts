import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Layers,
  ListChecks,
  History,
  AlertCircle,
  FolderOpen,
  MessageSquare,
  GraduationCap,
  CalendarClock,
  LifeBuoy,
  TrendingUp,
  Globe,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/tutors", label: "Tutor Management", icon: GraduationCap },
  { href: "/admin/batches", label: "Batches & Courses", icon: Layers },
  { href: "/admin/syllabus", label: "Syllabus", icon: ListChecks },
  { href: "/admin/materials", label: "Study Material", icon: FolderOpen },
  { href: "/admin/marketing", label: "Homepage Content", icon: Globe },
  { href: "/admin/activity", label: "Activity Log", icon: History },
  { href: "/admin/issues", label: "Issues", icon: AlertCircle },
];

export const TUTOR_NAV: NavItem[] = [
  { href: "/tutor", label: "Overview", icon: LayoutDashboard },
  { href: "/tutor/batches", label: "My Batches", icon: Layers },
  { href: "/tutor/syllabus", label: "Syllabus", icon: ListChecks },
  { href: "/tutor/materials", label: "Study Material", icon: FolderOpen },
  { href: "/tutor/communication", label: "Communication", icon: MessageSquare },
  { href: "/tutor/students", label: "Students", icon: Users },
];

export const STUDENT_NAV: NavItem[] = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/course", label: "My Course", icon: GraduationCap },
  { href: "/student/classes", label: "Classes", icon: CalendarClock },
  { href: "/student/progress", label: "Progress", icon: TrendingUp },
  { href: "/student/issues", label: "Issues", icon: LifeBuoy },
];

export type DashboardRole = "admin" | "tutor" | "student";

export const ROLE_NAV: Record<DashboardRole, NavItem[]> = {
  admin: ADMIN_NAV,
  tutor: TUTOR_NAV,
  student: STUDENT_NAV,
};

export const ROLE_LABEL: Record<DashboardRole, string> = {
  admin: "Admin",
  tutor: "Tutor",
  student: "Student",
};

export const ROLE_PROFILE_HREF: Record<DashboardRole, string> = {
  admin: "/admin/profile",
  tutor: "/tutor/profile",
  student: "/student/profile",
};
