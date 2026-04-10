import { Navigate, Route, Routes } from "react-router-dom";
import Spinner from "./components/shared/Spinner";
import { useAuth } from "./contexts/AuthContext";
import DashboardShell from "./layouts/DashboardShell";
import AdminAssignmentsPage from "./pages/admin/AdminAssignmentsPage";
import AdminAttendancePage from "./pages/admin/AdminAttendancePage";
import AdminClassesPage from "./pages/admin/AdminClassesPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRecordsPage from "./pages/admin/AdminRecordsPage";
import AdminResultsPage from "./pages/admin/AdminResultsPage";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import AdminSubjectsPage from "./pages/admin/AdminSubjectsPage";
import AdminTeachersPage from "./pages/admin/AdminTeachersPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import HomePage from "./pages/shared/HomePage";
import NotFoundPage from "./pages/shared/NotFoundPage";
import ProfilePage from "./pages/shared/ProfilePage";
import StudentAcademicsPage from "./pages/student/StudentAcademicsPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherAttendancePage from "./pages/teacher/TeacherAttendancePage";
import TeacherClassesPage from "./pages/teacher/TeacherClassesPage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherResultsPage from "./pages/teacher/TeacherResultsPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

function App() {
  const { bootstrapping } = useAuth();

  if (bootstrapping) {
    return <Spinner fullScreen label="Loading Smart School Student Management System..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/admin" element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/students" element={<RoleRoute allowedRoles={["admin"]}><AdminStudentsPage /></RoleRoute>} />
          <Route path="/admin/teachers" element={<RoleRoute allowedRoles={["admin"]}><AdminTeachersPage /></RoleRoute>} />
          <Route path="/admin/classes" element={<RoleRoute allowedRoles={["admin"]}><AdminClassesPage /></RoleRoute>} />
          <Route path="/admin/subjects" element={<RoleRoute allowedRoles={["admin"]}><AdminSubjectsPage /></RoleRoute>} />
          <Route path="/admin/assignments" element={<RoleRoute allowedRoles={["admin"]}><AdminAssignmentsPage /></RoleRoute>} />
          <Route path="/admin/attendance" element={<RoleRoute allowedRoles={["admin"]}><AdminAttendancePage /></RoleRoute>} />
          <Route path="/admin/results" element={<RoleRoute allowedRoles={["admin"]}><AdminResultsPage /></RoleRoute>} />
          <Route path="/admin/records" element={<RoleRoute allowedRoles={["admin"]}><AdminRecordsPage /></RoleRoute>} />

          <Route path="/teacher" element={<RoleRoute allowedRoles={["teacher"]}><TeacherDashboard /></RoleRoute>} />
          <Route path="/teacher/classes" element={<RoleRoute allowedRoles={["teacher"]}><TeacherClassesPage /></RoleRoute>} />
          <Route path="/teacher/attendance" element={<RoleRoute allowedRoles={["teacher"]}><TeacherAttendancePage /></RoleRoute>} />
          <Route path="/teacher/results" element={<RoleRoute allowedRoles={["teacher"]}><TeacherResultsPage /></RoleRoute>} />

          <Route path="/student" element={<RoleRoute allowedRoles={["student"]}><StudentDashboard /></RoleRoute>} />
          <Route path="/student/academics" element={<RoleRoute allowedRoles={["student"]}><StudentAcademicsPage /></RoleRoute>} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
