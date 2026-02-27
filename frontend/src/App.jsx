import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

import LandingPage from './pages/user/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ResumeUploadPage from './pages/resume/ResumeUploadPage';
import ResumeListPage from './pages/resume/ResumeListPage';
import ResumeDetailPage from './pages/resume/ResumeDetailPage';
import AnalysisPage from './pages/analysis/AnalysisPage';
import ReportDetailPage from './pages/analysis/ReportDetailPage';
import SkillGapPage from './pages/user/SkillGapPage';
import CoursesPage from './pages/user/CoursesPage';
import ProfilePage from './pages/user/ProfilePage';
import SettingsPage from './pages/user/SettingsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SkillManagement from './pages/admin/SkillManagement';
import JobRoleManagement from './pages/admin/JobRoleManagement';
import CourseManagement from './pages/admin/CourseManagement';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resumes" element={<ResumeListPage />} />
        <Route path="/resumes/upload" element={<ResumeUploadPage />} />
        <Route path="/resumes/:id" element={<ResumeDetailPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/analysis/:id" element={<ReportDetailPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/admin/skills" element={<AdminRoute><SkillManagement /></AdminRoute>} />
        <Route path="/admin/job-roles" element={<AdminRoute><JobRoleManagement /></AdminRoute>} />
        <Route path="/admin/courses" element={<AdminRoute><CourseManagement /></AdminRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
