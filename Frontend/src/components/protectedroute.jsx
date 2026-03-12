import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {

  const location = useLocation();

  const token = localStorage.getItem("token");

  /* ================= USER ================= */

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  /* 🔐 Not logged in */

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /* 🔒 Role-based protection */

  if (roles && (!user.role || !roles.includes(user.role))) {
    return <Navigate to="/tickets" replace />;
  }

  return children;
}