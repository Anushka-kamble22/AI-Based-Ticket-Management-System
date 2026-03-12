import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../api/api";

export default function Tickets() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Login required");
      navigate("/login");
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description required");
      return;
    }

    try {

      setLoading(true);

      const data = await api.createTicket({
        title: title.trim(),
        description: description.trim()
      });

      const ticket = data.ticket || data;

      toast.success("Ticket created 🎉");

      setTitle("");
      setDescription("");

      navigate(`/ticket/${ticket._id}`);

    } catch (err) {

      console.error(err);
      toast.error(err.message || "Failed to create ticket");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="tickets-page">

      {/* Create Ticket Card */}

      <motion.div
        className="create-ticket-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        <h2 className="section-title">
          Create Ticket
        </h2>

        <form onSubmit={handleSubmit} className="tickets-form">

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter ticket title"
            className="glass-input"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            placeholder="Describe your issue"
            className="glass-textarea"
            required
          />

          <button
            type="submit"
            className="glass-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Submit Ticket"}
          </button>

        </form>

      </motion.div>

    </div>

  );

}