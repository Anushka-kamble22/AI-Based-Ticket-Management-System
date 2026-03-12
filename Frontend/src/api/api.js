const API = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

/* ================= CORE REQUEST ================= */

async function request(endpoint, options = {}) {

  const res = await fetch(`${API}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  try {
    return res.json();
  } catch (e) {
    return res.text();
  }
}

/* ================= API ================= */

export const api = {

  /* ================= AUTH ================= */

  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),

  signup: (data) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),

  getUsers: () =>
    request("/auth/users"),

  updateUserRole: (id, role) =>
    request(`/auth/admin/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role })
    }),

  /* ================= TICKETS ================= */

  getTickets: () =>
    request("/tickets"),

  getTicket: (id) =>
    request(`/tickets/${id}`),

  createTicket: (ticket) =>
    request("/tickets", {
      method: "POST",
      body: JSON.stringify(ticket)
    }),

  updateTicketStatus: (id, status) =>
    request(`/tickets/admin/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    }),

  deleteTicket: (id) =>
    request(`/tickets/admin/${id}`, {
      method: "DELETE"
    }),

  assignModerator: (ticketId, moderatorId) =>
    request(`/tickets/admin/${ticketId}/assign`, {
      method: "PUT",
      body: JSON.stringify({ moderatorId })
    }),

  /* ================= ADMIN ================= */

  getAdminStats: () =>
    request("/tickets/admin/stats"),

  getAdminTickets: () =>
    request("/tickets/admin/all")

};