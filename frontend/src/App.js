import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import RoleProtectedAdminRoute from "./components/RoleProtectedAdminRoute";

import CreateScheduleQuiz from "./pages/admin/CreateScheduleQuiz";
import ManageScheduledQuizzes from "./pages/admin/ManageScheduledQuizzes";
import ScheduledQuizDetails from "./pages/admin/ScheduledQuizDetails";

import ManageDraftQuizzes from "./pages/admin/ManageDraftQuizzes";
import DraftQuizDetails from "./pages/admin/DraftQuizDetails";
import FinalizedQuizzes from "./pages/admin/FinalizedQuizzes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Dashboard */}
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

        {/* Finalized Quizzes (READY) */}
        <Route
          path="/admin/quizzes/finalized"
          element={
            <RoleProtectedAdminRoute allowedRoles={["SCHEDULE_ADMIN", "QUIZ_ADMIN"]}>
              <FinalizedQuizzes />
            </RoleProtectedAdminRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<div style={{ padding: 24 }}>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}