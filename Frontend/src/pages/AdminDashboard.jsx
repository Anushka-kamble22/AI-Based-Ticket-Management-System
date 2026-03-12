import { useEffect, useState } from "react";
import { api } from "../api/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {

  const [stats, setStats] = useState({});
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const moderators = users?.filter(user => user.role === "moderator") || [];

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= FETCH DATA ================= */

  const fetchData = async () => {

    try {

      setLoading(true);

      const [statsData, ticketsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminTickets(),
        api.getUsers()
      ]);

      setStats(statsData || {});
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);

    } catch (error) {

      console.error("Admin fetch error:", error);

    } finally {

      setLoading(false);

    }

  };

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (id, status) => {

    try {

      await api.updateTicketStatus(id, status);

      setTickets(prev =>
        prev.map(ticket =>
          ticket._id === id ? { ...ticket, status } : ticket
        )
      );

      toast.success("Status updated successfully!");

    } catch (error) {

      console.error("Status update failed:", error);
      toast.error(`Failed to update status: ${error.message}`);

    }

  };

  /* ================= DELETE ================= */

  const deleteTicket = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this ticket?"
    );

    if (!confirmDelete) return;

    try {

      console.log("Deleting ticket:", id);

      await api.deleteTicket(id);

      setTickets(prev =>
        prev.filter(ticket => ticket._id !== id)
      );

      toast.success("Ticket deleted successfully!");

    } catch (error) {

      console.error("Delete failed:", error);
      toast.error(`Failed to delete ticket: ${error.message}`);

    }

  };

  /* ================= UPDATE USER ROLE ================= */

  const updateRole = async (id, role) => {

    try {

      await api.updateUserRole(id, role);

      setUsers(prev =>
        prev.map(user =>
          user._id === id ? { ...user, role } : user
        )
      );

      toast.success("User role updated successfully!");

    } catch (error) {

      console.error("Role update failed:", error);
      toast.error(`Failed to update role: ${error.message}`);

    }

  };

  /* ================= ASSIGN MODERATOR ================= */

  const assignModerator = async (ticketId, moderatorId) => {

    if (!moderatorId) return;

    try {

      await api.assignModerator(ticketId, moderatorId);

      const assignedModerator = users.find(u => u._id === moderatorId);

      setTickets(prev =>
        prev.map(ticket =>
          ticket._id === ticketId
            ? { ...ticket, assignedTo: assignedModerator }
            : ticket
        )
      );

    } catch (error) {

      console.error("Assign failed:", error);

    }

  };

  /* ================= FILTER ================= */

  const filteredTickets = tickets.filter(ticket => {

    const title = (ticket.title || "").toLowerCase();
    const description = (ticket.description || "").toLowerCase();
    const query = search.toLowerCase();

    const matchesSearch =
      !query ||
      title.includes(query) ||
      description.includes(query);

    const matchesFilter =
      filter === "ALL" ? true : ticket.status === filter;

    return matchesSearch && matchesFilter;

  });

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="glass-spinner"></div>
      </div>
    );
  }

  return (

    <div className="admin-wrapper">

      <h2>Admin Dashboard</h2>

      {/* SEARCH */}

      <div className="admin-search-bar">
        <input
          type="text"
          placeholder="🔍 Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= STATS ================= */}

      <div className="stats-grid">

        <StatCard label="Total Tickets" value={stats.totalTickets} active={filter==="ALL"} onClick={() => setFilter("ALL")} />
        <StatCard label="Completed" value={stats.completed} active={filter==="COMPLETED"} onClick={() => setFilter("COMPLETED")} />
        <StatCard label="Processing" value={stats.inProgress} active={filter==="IN_PROGRESS"} onClick={() => setFilter("IN_PROGRESS")} />
        <StatCard label="Pending" value={stats.pending} active={filter==="TODO"} onClick={() => setFilter("TODO")} />

        <div
          className="admin-card"
          onClick={() =>
            document
              .getElementById("users-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <h4>Total Users</h4>
          <p>{stats.totalUsers || 0}</p>
        </div>

      </div>

      {/* ================= TICKETS ================= */}

      <h3>All Tickets</h3>

      {filteredTickets.length === 0 && <p>No tickets found.</p>}

      <div className="ticket-admin-grid">

        {filteredTickets.map(ticket => (

          <div key={ticket._id} className="admin-card">

            <div className={`ticket-status status-${ticket.status}`}>
              {ticket.status}
            </div>

            <h4>{ticket.title}</h4>

            <p>{ticket.description}</p>

            <p>
              <strong>User:</strong> {ticket.createdBy?.email || "Unknown"}
            </p>

            <p>
              <strong>Assigned:</strong> {ticket.assignedTo?.email || "Not Assigned"}
            </p>

            <select
              className="glass-select"
              value={ticket.assignedTo?._id || ""}
              onChange={(e) =>
                assignModerator(ticket._id, e.target.value)
              }
              disabled={moderators.length === 0}
            >
              <option value="">Unassigned</option>

              {moderators.map(mod => (
                <option key={mod._id} value={mod._id}>
                  {mod.email}
                </option>
              ))}

            </select>

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

            <button
              className="delete-ticket-btn"
              onClick={() => deleteTicket(ticket._id)}
            >
              Delete Ticket
            </button>

          </div>

        ))}

      </div>

      {/* ================= USERS ================= */}

      <h3 id="users-section">All Users</h3>

      {users.length === 0 && <p>No users found.</p>}

      <div className="user-admin-grid">

        {users.map(user => (

          <div key={user._id} className="admin-card">

            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>

            <select
              className="glass-select"
              value={user.role}
              onChange={(e) =>
                updateRole(user._id, e.target.value)
              }
            >
              <option value="user">user</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>

          </div>

        ))}

      </div>

    </div>

  );

}

/* ================= STAT CARD ================= */

function StatCard({ label, value, active, onClick }) {

  return (

    <div
      className={`admin-card ${active ? "active-stat" : ""}`}
      onClick={onClick}
    >
      <h4>{label}</h4>
      <p>{value || 0}</p>
    </div>

  );

}