import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { socket } from "../socket/socket";

export default function Dashboard() {

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.email?.split("@")[0];

  const [tickets, setTickets] = useState([]);

  /* ================= FETCH TICKETS ================= */

  const fetchTickets = async () => {

    try {

      const data = await api.getTickets();

      const ticketData =
        Array.isArray(data)
          ? data
          : Array.isArray(data.tickets)
          ? data.tickets
          : [];

      setTickets(ticketData);

    } catch (err) {

      console.error("Error fetching tickets:", err);

    }

  };

  /* ================= SOCKET + INITIAL FETCH ================= */

  useEffect(() => {

    fetchTickets();

    socket.connect();

    socket.on("ticketUpdated", (updatedTicket) => {

      setTickets((prev) =>
        prev.map((t) =>
          t._id === updatedTicket._id ? updatedTicket : t
        )
      );

    });

    return () => {
      socket.off("ticketUpdated");
      socket.disconnect();
    };

  }, []);

  /* ================= PRIORITY SORT ================= */

  const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  const sortedTickets = [...tickets].sort(
    (a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
  );

  /* ================= UI ================= */

  return (

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >

      <h2>Dashboard</h2>

      <p>Welcome back {username} 👋</p>

      <p>This is your AI Ticket dashboard.</p>

      <div style={{ marginTop: "20px" }}>

        {sortedTickets.length === 0 && (
          <p>No tickets found.</p>
        )}

        {sortedTickets.map((ticket) => (

          <div
            key={ticket._id}
            style={{
              border: "1px solid #ddd",
              padding: "14px",
              marginBottom: "12px",
              borderRadius: "8px",
              background: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }}
          >

            <h4>{ticket.title}</h4>

            <p style={{ marginBottom: "8px" }}>
              {ticket.description}
            </p>

            <div style={{ display: "flex", gap: "10px" }}>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontWeight: "600",
                  fontSize: "12px",
                  background:
                    ticket.priority === "HIGH"
                      ? "#ff4d4f"
                      : ticket.priority === "MEDIUM"
                      ? "#faad14"
                      : "#52c41a",
                  color: "white"
                }}
              >
                Priority: {ticket.priority || "Analyzing"}
              </span>

              <span
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "#eee"
                }}
              >
                {ticket.status}
              </span>

            </div>

          </div>

        ))}

      </div>

    </motion.div>

  );

}