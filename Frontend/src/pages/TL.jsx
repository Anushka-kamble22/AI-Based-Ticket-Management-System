import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/api";

export default function TicketList() {

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ================= FETCH ================= */

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

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchTickets();
  }, []);

  /* ================= COUNTS ================= */

  const counts = {
    ALL: tickets.length,
    TODO: tickets.filter(t => t.status === "TODO").length,
    PROCESSING: tickets.filter(t => t.status === "PROCESSING").length,
    COMPLETED: tickets.filter(t => t.status === "COMPLETED").length,
    FAILED: tickets.filter(t => t.status === "FAILED").length
  };

  /* ================= FILTER + SEARCH + SORT ================= */

  const filteredTickets = tickets
    .filter(ticket => {

      const title = ticket.title?.toLowerCase() || "";
      const desc = ticket.description?.toLowerCase() || "";
      const query = search.toLowerCase();

      return title.includes(query) || desc.includes(query);

    })
    .filter(ticket => {

      if (statusFilter === "ALL") return true;
      return ticket.status === statusFilter;

    })
    .sort((a, b) => {

      switch (sortBy) {

        case "NEWEST":
          return new Date(b.createdAt) - new Date(a.createdAt);

        case "OLDEST":
          return new Date(a.createdAt) - new Date(b.createdAt);

        case "STATUS":
          return (a.status || "").localeCompare(b.status || "");

        case "PRIORITY":
          return (a.priority || "").localeCompare(b.priority || "");

        default:
          return 0;

      }

    });

  /* ================= UI ================= */

  return (

    <div className="tickets-wrapper">

      <div className="tickets-container">

        {/* TOOLBAR */}
        <div className="glass-toolbar">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="🔍 Search tickets..."
            className="glass-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* SORT */}
          <div className="tickets-sort">

            <span className="sort-label">Sort</span>

            <select
              className="glass-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="NEWEST">Newest</option>
              <option value="OLDEST">Oldest</option>
              <option value="STATUS">Status</option>
              <option value="PRIORITY">Priority</option>
            </select>

          </div>

          {/* FILTERS */}
          <div className="tickets-filters">

            <FilterBtn
              label="All"
              count={counts.ALL}
              active={statusFilter === "ALL"}
              onClick={() => setStatusFilter("ALL")}
            />

            <FilterBtn
              label="Todo"
              count={counts.TODO}
              active={statusFilter === "TODO"}
              onClick={() => setStatusFilter("TODO")}
            />

            <FilterBtn
              label="Completed"
              count={counts.COMPLETED}
              active={statusFilter === "COMPLETED"}
              onClick={() => setStatusFilter("COMPLETED")}
            />

            <FilterBtn
              label="Failed"
              count={counts.FAILED}
              active={statusFilter === "FAILED"}
              onClick={() => setStatusFilter("FAILED")}
            />

          </div>

        </div>

        <h2 className="section-title">Your Tickets</h2>

        {/* LOADING */}
        {loading ? (

          <div className="loader-wrapper">
            <div className="glass-spinner"></div>
          </div>

        ) : (

          <div className="tickets-grid">

            {filteredTickets.length === 0 && (
              <p>No tickets found</p>
            )}

            {filteredTickets.map(ticket => (

              <motion.div
  key={ticket._id}
  className="ticket-card"
  whileHover={{ scale: 1.03 }}
  onClick={() => navigate(`/ticket/${ticket._id}`)}
>

  {/* HEADER */}
  <div className="ticket-header">

    <h3>{ticket.title}</h3>

    <span className={`priority-badge priority-${ticket.priority?.toLowerCase()}`}>
  <span className="priority-dot"></span>
  {ticket.priority}
</span>

  </div>

  {/* DESCRIPTION */}
  <p>{ticket.description}</p>

  {/* FOOTER */}
  <div className="ticket-footer">

    <span className={`status-badge status-${ticket.status?.toLowerCase()}`}>
      {ticket.status}
    </span>

  </div>

</motion.div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

/* ================= FILTER BUTTON ================= */

function FilterBtn({ label, count, active, onClick }) {

  return (

    <button
      className={`filter-btn ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {label} ({count})
    </button>

  );

}