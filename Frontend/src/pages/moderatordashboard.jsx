import { useEffect, useState } from "react";
import { api } from "../api/api";
import { socket } from "../socket/socket";

export default function ModeratorDashboard() {

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  /* ================= FETCH ================= */

  const fetchTickets = async () => {

    try {

      setLoading(true);

      const data = await api.getTickets();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.tickets)
        ? data.tickets
        : [];

      setTickets(list);
      setFilteredTickets(list);

    } catch (error) {

      console.error("Fetch tickets error:", error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchTickets();
  }, []);

  /* ================= SOCKET ================= */

  useEffect(() => {

    socket.connect();

    socket.on("ticketCreated", fetchTickets);
    socket.on("ticketUpdated", fetchTickets);
    socket.on("ticketDeleted", fetchTickets);

    return () => {

      socket.off("ticketCreated");
      socket.off("ticketUpdated");
      socket.off("ticketDeleted");

      socket.disconnect();

    };

  }, []);

  /* ================= SEARCH + FILTER ================= */

  useEffect(() => {

    let temp = [...tickets];

    if (search) {

      temp = temp.filter(ticket =>
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase())
      );

    }

    if (filter !== "ALL") {

      temp = temp.filter(ticket =>
        ticket.status === filter
      );

    }

    setFilteredTickets(temp);

  }, [search, filter, tickets]);

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (id, status) => {

    try {

      await api.updateTicketStatus(id, status);

      fetchTickets();

    } catch (error) {

      console.error("Status update error:", error);

    }

  };

  /* ================= PRIORITY COLOR ================= */

  const priorityColor = (priority) => {

    if (priority === "HIGH") return "priority-high";
    if (priority === "LOW") return "priority-low";
    return "priority-medium";

  };

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="loader-wrapper">
        <div className="glass-spinner"></div>
      </div>
    );

  }

  /* ================= KANBAN DATA ================= */

  const todo = filteredTickets.filter(t => t.status === "TODO");
  const progress = filteredTickets.filter(t => t.status === "IN_PROGRESS");
  const completed = filteredTickets.filter(t => t.status === "COMPLETED");

  return (

    <div className="moderator-wrapper">

      <h2>Moderator Dashboard</h2>

      <div className="dashboard-controls">

        <input
          className="glass-input"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="glass-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

      </div>

      <div className="kanban-board">

        <Column title="TODO" tickets={todo} updateStatus={updateStatus} priorityColor={priorityColor} />

        <Column title="IN_PROGRESS" tickets={progress} updateStatus={updateStatus} priorityColor={priorityColor} />

        <Column title="COMPLETED" tickets={completed} updateStatus={updateStatus} priorityColor={priorityColor} />

      </div>

    </div>

  );

}

/* ================= COLUMN ================= */

function Column({ title, tickets, updateStatus, priorityColor }) {

  return (

    <div className="kanban-column">

      <h3>{title} ({tickets.length})</h3>

      {tickets.map(ticket => (

        <TicketCard
          key={ticket._id}
          ticket={ticket}
          updateStatus={updateStatus}
          priorityColor={priorityColor}
        />

      ))}

    </div>

  );

}

/* ================= CARD ================= */

function TicketCard({ ticket, updateStatus, priorityColor }) {

  return (

    <div className="admin-card">

      <div className={`ticket-status status-${ticket.status}`}>
        {ticket.status}
      </div>

      {ticket.priority && (
        <div className={`priority-badge ${priorityColor(ticket.priority)}`}>
          {ticket.priority}
        </div>
      )}

      <h4>{ticket.title}</h4>

      <p>{ticket.description}</p>

      <p>
        <strong>User:</strong> {ticket.createdBy?.email || "Unknown"}
      </p>

      {ticket.assignedTo && (
        <p>
          <strong>Assigned:</strong> {ticket.assignedTo.email}
        </p>
      )}

      <select
        className="glass-select"
        value={ticket.status}
        onChange={(e) =>
          updateStatus(ticket._id, e.target.value)
        }
      >
        <option value="TODO">TODO</option>
        <option value="IN_PROGRESS">IN_PROGRESS</option>
        <option value="COMPLETED">COMPLETED</option>
      </select>

    </div>

  );

}