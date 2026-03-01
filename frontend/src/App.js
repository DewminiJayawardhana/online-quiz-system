import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

import StudentRegister from "./pages/student/StudentRegister";
import StudentHome from "./pages/student/StudentHome";
import StudentQuizPlay from "./pages/student/StudentQuizPlay";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import RoleProtectedAdminRoute from "./components/RoleProtectedAdminRoute";

import CreateScheduleQuiz from "./pages/admin/CreateScheduleQuiz";
import ManageScheduledQuizzes from "./pages/admin/ManageScheduledQuizzes";
import ScheduledQuizDetails from "./pages/admin/ScheduledQuizDetails";

import ManageDraftQuizzes from "./pages/admin/ManageDraftQuizzes";
import DraftQuizDetails from "./pages/admin/DraftQuizDetails";

import FinalizeQuizzes from "./pages/admin/FinalizeQuizzes";
import FinalizeQuizDetails from "./pages/admin/FinalizeQuizDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home + Auth */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Student */}
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/student/quizzes/:id" element={<StudentQuizPlay />} />

        {/* Admin Login (optional separate route) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Dashboard (any admin) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* Create Quiz (Schedule Admin only) */}
        <Route
          path="/admin/quizzes/create"
          element={
            <RoleProtectedAdminRoute allowedRoles={["SCHEDULE_ADMIN"]}>
              <CreateScheduleQuiz />
            </RoleProtectedAdminRoute>
          }
        />

        {/* Scheduled Quizzes (Schedule Admin + Quiz Admin) */}
        <Route
          path="/admin/quizzes/scheduled"
          element={
            <RoleProtectedAdminRoute allowedRoles={["SCHEDULE_ADMIN", "QUIZ_ADMIN"]}>
              <ManageScheduledQuizzes />
            </RoleProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/quizzes/scheduled/:id"
          element={
            <RoleProtectedAdminRoute allowedRoles={["SCHEDULE_ADMIN", "QUIZ_ADMIN"]}>
              <ScheduledQuizDetails />
            </RoleProtectedAdminRoute>
          }
        />

        {/* Draft Quizzes (Schedule Admin + Quiz Admin) */}
        <Route
          path="/admin/quizzes/drafts"
          element={
            <RoleProtectedAdminRoute allowedRoles={["SCHEDULE_ADMIN", "QUIZ_ADMIN"]}>
              <ManageDraftQuizzes />
            </RoleProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/quizzes/drafts/:id"
          element={
            <RoleProtectedAdminRoute allowedRoles={["SCHEDULE_ADMIN", "QUIZ_ADMIN"]}>
              <DraftQuizDetails />
            </RoleProtectedAdminRoute>
          }
        />

        {/* Finalize Section (MAIN ADMIN only) */}
        <Route
          path="/admin/quizzes/finalized"
          element={
            <RoleProtectedAdminRoute allowedRoles={["MAIN_ADMIN"]}>
              <FinalizeQuizzes />
            </RoleProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/quizzes/finalize/:id"
          element={
            <RoleProtectedAdminRoute allowedRoles={["MAIN_ADMIN"]}>
              <FinalizeQuizDetails />
            </RoleProtectedAdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}