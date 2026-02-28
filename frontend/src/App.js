import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import CreateScheduleQuiz from "./pages/admin/CreateScheduleQuiz";
import RoleProtectedAdminRoute from "./components/RoleProtectedAdminRoute";
// Temporary placeholder pages
const Placeholder = ({ title }) => (
  <div style={{ padding: 24 }}>
    <h2>{title}</h2>
    <p>This page will be built next.</p>
  </div>
);

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

        {/* Quiz Sections */}
        <Route
  path="/admin/quizzes/create"
  element={
    <RoleProtectedAdminRoute allowedRoles={["SCHEDULE_ADMIN"]}>
      <CreateScheduleQuiz />
    </RoleProtectedAdminRoute>
  }
/>

        <Route
          path="/admin/quizzes/scheduled"
          element={
            <ProtectedAdminRoute>
              <Placeholder title="Manage Scheduled Quizzes (Add Questions)" />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/quizzes/drafts"
          element={
            <ProtectedAdminRoute>
              <Placeholder title="Manage Draft Quizzes" />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/quizzes/finalized"
          element={
            <ProtectedAdminRoute>
              <Placeholder title="Finalized Quizzes – Ready for Submission" />
            </ProtectedAdminRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={<div style={{ padding: 24 }}>404 - Page Not Found</div>}
        />

      </Routes>
    </BrowserRouter>
  );
}