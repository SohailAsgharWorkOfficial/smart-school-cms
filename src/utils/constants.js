import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  School,
  ScrollText,
  UserCircle2,
  Users,
  UsersRound,
} from "lucide-react";

export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
};

export const ATTENDANCE_OPTIONS = ["present", "absent", "late", "excused"];

export const ROLE_NAVIGATION = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/students", label: "Students", icon: GraduationCap },
    { to: "/admin/teachers", label: "Teachers", icon: UsersRound },
    { to: "/admin/classes", label: "Classes", icon: School },
    { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
    { to: "/admin/assignments", label: "Assignments", icon: Users },
    { to: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
    { to: "/admin/results", label: "Results", icon: ScrollText },
    { to: "/admin/records", label: "School Records", icon: UserCircle2 },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { to: "/teacher/classes", label: "My Classes", icon: School },
    { to: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
    { to: "/teacher/results", label: "Results", icon: ScrollText },
    { to: "/profile", label: "Profile", icon: UserCircle2 },
  ],
  student: [
    { to: "/student", label: "Dashboard", icon: LayoutDashboard },
    { to: "/student/academics", label: "Academics", icon: BookOpen },
    { to: "/profile", label: "Profile", icon: UserCircle2 },
  ],
};

export const DASHBOARD_REDIRECT = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};
