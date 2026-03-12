import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { api } from "../api/api";

export default function TicketDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

  const fetchTicket = async () => {

    try {

      const data = await api.getTicket(id);

      const ticketData = data.ticket || data;

      setTicket(ticketData);

      if (ticketData?.aiSummary) {
        setLoading(false);
      }

      return ticketData;

    } catch (err) {

      console.error("Error fetching ticket:", err);
      setLoading(false);

    }

  };

  /* ================= POLLING ================= */

  useEffect(() => {

    let interval;

    const startPolling = async () => {

      const firstTicket = await fetchTicket();

      if (!firstTicket?.aiSummary) {

        interval = setInterval(async () => {

          const updatedTicket = await fetchTicket();

          if (updatedTicket?.aiSummary) {
            clearInterval(interval);
          }

        }, 3000);

      }

    };

    startPolling();

    return () => {
      if (interval) clearInterval(interval);
    };

  }, [id]);

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div className="details-page">

        <div className="details-container">

          <button
            className="back-btn"
            onClick={() => navigate("/tickets/list")}
          >
            ← Back to Tickets
          </button>

          <div className="details-card">
            <h2>🤖 AI is analyzing your ticket...</h2>
            <p>Please wait while we process your issue.</p>
          </div>

        </div>

      </div>

    );

  }

  /* ================= NOT FOUND ================= */

  if (!ticket) {

    return (

      <div className="details-page">

        <div className="details-container">

          <button
            className="back-btn"
            onClick={() => navigate("/tickets/list")}
          >
            ← Back to Tickets
          </button>

          <div className="details-card">
            <h2>Ticket not found</h2>
          </div>

        </div>

      </div>

    );

  }

  /* ================= MAIN UI ================= */

  return (

    <div className="details-page">

      <div className="details-container">

        <button
          className="back-btn"
          onClick={() => navigate("/tickets/list")}
        >
          ← Back to Tickets
        </button>

        <motion.div
          className="details-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >

          <h2 className="details-title">{ticket.title}</h2>

          <p className="details-description">
            {ticket.description}
          </p>

          <div className="details-divider" />

          <div className="status-badge">
            Status: {ticket.status}
          </div>

          <div className="priority-badge">
            {ticket.priority
              ? `Priority: ${ticket.priority}`
              : "Priority: Analyzing with AI..."}
          </div>

          {ticket.assignedTo && (
            <p>
              <strong>Assigned To:</strong> {ticket.assignedTo?.email}
            </p>
          )}

          {ticket.createdAt && (
            <p>
              <strong>Created:</strong>{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          )}

          {ticket.relatedSkills?.length > 0 && (

            <section className="details-section">

              <h3>🛠 Related Skills</h3>

              <div className="skills-container">

                {ticket.relatedSkills.map((skill, i) => (
                  <span key={i} className="skill-tag">
                    {skill}
                  </span>
                ))}

              </div>

            </section>

          )}

          {ticket.aiSummary && (

            <section className="details-section">

              <h3>📝 AI Summary</h3>

              <p>{ticket.aiSummary}</p>

            </section>

          )}

          {ticket.helpfulNotes && (

            <section className="details-section">

              <h3>💡 Helpful Notes</h3>

              <div className="details-markdown">
                <ReactMarkdown>
                  {ticket.helpfulNotes}
                </ReactMarkdown>
              </div>

            </section>

          )}

        </motion.div>

      </div>

    </div>

  );

}