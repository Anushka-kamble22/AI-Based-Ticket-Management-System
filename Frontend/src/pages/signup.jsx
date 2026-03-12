import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../api/api";

export default function SignupPage() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ================= INPUT ================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  /* ================= SIGNUP ================= */

  const handleSignup = async (e) => {

    e.preventDefault();

    if (loading) return;

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {

      const data = await api.signup({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      toast.success("Account created 🎉");

      /* ================= SAVE AUTH ================= */

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      /* ================= REDIRECT ================= */

      if (data.user.role === "admin") {
        navigate("/admin", { replace: true });

      } else if (data.user.role === "moderator") {
        navigate("/moderator", { replace: true });

      } else {
        navigate("/tickets", { replace: true });
      }

    } catch (error) {

      console.error(error);
      toast.error(error.message || "Server not reachable");

    } finally {

      setLoading(false);

    }

  };

  /* ================= UI ================= */

  return (

    <div className="auth-wrapper">

      <motion.form
        onSubmit={handleSignup}
        className="auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        <h2>Create Account ✨</h2>

        <p className="auth-sub">
          Join the AI Ticket System
        </p>

        {/* EMAIL */}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="glass-input"
        />

        {/* PASSWORD */}

        <div className="password-wrapper">

          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="glass-input"
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </span>

        </div>

        {/* BUTTON */}

        <motion.button
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          disabled={loading}
          type="submit"
          className="glass-btn"
          style={{
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Signup"}
        </motion.button>

        {/* LOGIN LINK */}

        <p className="auth-footer">

          Already have an account?

          <span onClick={() => navigate("/login")}>
            Login
          </span>

        </p>

      </motion.form>

    </div>

  );

}