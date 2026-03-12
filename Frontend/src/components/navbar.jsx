import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {

  const navigate = useNavigate();
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

  const username = user?.email?.split("@")[0] || "User";

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  /* ================= DASHBOARD ROUTE ================= */

  const goDashboard = () => {

    if (!user) return navigate("/login");

    if (user.role === "admin") {
      navigate("/admin");
    }

    else if (user.role === "moderator") {
      navigate("/moderator");
    }

    else {
      navigate("/tickets");
    }
  };

  return (
    <div className="glass-navbar">

      <Link to="/tickets" className="navbar-logo">
        🚀 Ticket AI
      </Link>

      <div className="navbar-right">

        {!token ? (
          <>
            <Link
              to="/signup"
              className={`glass-nav-btn ${location.pathname === "/signup" ? "active" : ""}`}
            >
              Signup
            </Link>

            <Link
              to="/login"
              className={`glass-nav-btn ${location.pathname === "/login" ? "active" : ""}`}
            >
              Login
            </Link>
          </>
        ) : (
          <>
            <span className="navbar-user">
              Hi, {username}
            </span>

            {(user?.role === "admin" || user?.role === "moderator") && (
              <button
                onClick={goDashboard}
                className="glass-nav-btn"
              >
                Dashboard
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="glass-logout-btn"
            >
              Logout
            </motion.button>
          </>
        )}

      </div>

    </div>
  );
}