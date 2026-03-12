import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { socket } from "../socket/socket";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function Layout() {

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  /* ================= SOCKET ================= */

  useEffect(() => {

  if (!socket.connected) {
    socket.connect();
  }

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

}, []);

  /* ================= TOKEN ================= */

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

  /* ================= ROUTE RULES ================= */

  const authRoutes = ["/login", "/signup", "/forgot-password"];

  const isAuthPage = authRoutes.includes(pathname);

  const isTicketDetails = pathname.startsWith("/ticket/");
  const isTicketList = pathname === "/tickets/list";

  const hideSidebar = isAuthPage;
  const hideTopbar = isAuthPage || isTicketDetails;

  /* ================= DASHBOARD NAVIGATION ================= */

  const goToDashboard = () => {

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

  /* ================= LOGOUT ================= */

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="layout-wrapper">

      {/* ================= SIDEBAR ================= */}

      {!hideSidebar && token && (
        <aside className="glass-sidebar">

          <h2 className="sidebar-logo">🚀 AI Ticket</h2>

          <SidebarBtn
            label="Dashboard"
            active={
              pathname === "/admin" ||
              pathname === "/moderator" ||
              pathname === "/tickets"
            }
            onClick={goToDashboard}
          />

          <SidebarBtn
            label="Create Ticket"
            active={pathname === "/tickets"}
            onClick={() => navigate("/tickets")}
          />

          <SidebarBtn
            label="Your Tickets"
            active={isTicketList}
            onClick={() => navigate("/tickets/list")}
          />

          <div className="sidebar-bottom">
            <button
              onClick={logout}
              className="logout-btn"
            >
              Logout
            </button>
          </div>

        </aside>
      )}

      {/* ================= MAIN ================= */}

      <div className="layout-main">

        {/* ================= TOPBAR ================= */}

        {!hideTopbar && token && (
          <div className="glass-topbar">

            <h3 className="topbar-greeting">
              Welcome {username} 👋
            </h3>

            <div className="topbar-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

          </div>
        )}

        {/* ================= PAGE CONTENT ================= */}

        <main className="layout-content">

          <AnimatePresence mode="wait">

            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>

          </AnimatePresence>

        </main>

      </div>

    </div>
  );
}

/* ================= SIDEBAR BUTTON ================= */

function SidebarBtn({ label, active, onClick }) {

  return (
    <button
      onClick={onClick}
      className={`sidebar-btn ${active ? "active" : ""}`}
    >
      {label}
    </button>
  );
}