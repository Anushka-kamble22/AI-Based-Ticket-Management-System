import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ================= PAGES ================= */

import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import AdminDashboard from "./pages/AdminDashboard";
import Tickets from "./pages/tickets";
import TicketDetails from "./pages/TicketDetails";
import TicketList from "./pages/TicketList";
import ForgotPassword from "./pages/ForgotPassword";
import ModeratorDashboard from "./pages/ModeratorDashboard";

/* ================= COMPONENTS ================= */

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

/* ================= AUTH HELPER ================= */

const getUser = () => {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  return token && user ? user : null;
};

/* ================= REDIRECT IF LOGGED IN ================= */

const RedirectIfLoggedIn = ({ children }) => {
  const user = getUser();

  if (!user) return children;

  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "moderator") return <Navigate to="/moderator" replace />;

  return <Navigate to="/tickets" replace />;
};

/* ================= ROOT REDIRECT ================= */

const RootRedirect = () => {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "moderator") return <Navigate to="/moderator" replace />;

  return <Navigate to="/tickets" replace />;
};

/* ================= APP ================= */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>

      <Toaster position="top-right" />

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/login"
          element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          }
        />

        <Route
          path="/signup"
          element={
            <RedirectIfLoggedIn>
              <SignupPage />
            </RedirectIfLoggedIn>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <RedirectIfLoggedIn>
              <ForgotPassword />
            </RedirectIfLoggedIn>
          }
        />

        {/* PROTECTED ROUTES */}

        <Route element={<Layout />}>

          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/list"
            element={
              <ProtectedRoute>
                <TicketList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ticket/:id"
            element={
              <ProtectedRoute>
                <TicketDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/moderator"
            element={
              <ProtectedRoute roles={["moderator"]}>
                <ModeratorDashboard />
              </ProtectedRoute>
            }
          />

        </Route>

        <Route path="/" element={<RootRedirect />} />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </BrowserRouter>
  </React.StrictMode>
);