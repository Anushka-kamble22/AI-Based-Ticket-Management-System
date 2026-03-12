import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { api } from "../api/api";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    try {

      setLoading(true);

      await api.forgotPassword(email);

      toast.success("Reset link sent to your email!");
      setEmail("");

    } catch (error) {

      console.error(error);
      toast.error(error.message || "Something went wrong");

    } finally {

      setLoading(false);

    }

  };

  /* ================= UI ================= */

  return (

    <div className="auth-wrapper">

      <motion.form
        onSubmit={handleSubmit}
        className="auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        <h2>Forgot Password 🔑</h2>

        <p className="auth-sub">
          Enter your registered email to receive a reset link
        </p>

        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="glass-input"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          type="submit"
          className="glass-btn"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </motion.button>

        <p className="login-redirect">
          Remember your password? <Link to="/login">← Login</Link>
        </p>

      </motion.form>

    </div>

  );

}