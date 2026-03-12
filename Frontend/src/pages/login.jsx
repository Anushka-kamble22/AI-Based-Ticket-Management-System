import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../api/api";

export default function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  /* ================= AUTO REDIRECT ================= */

  useEffect(() => {

    const token = localStorage.getItem("token");

    let user = null;

    try {
      const storedUser = localStorage.getItem("user");
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
      user = null;
    }

    if (token && user) {

      if (user.role === "admin") {
        navigate("/admin", { replace: true });

      } else if (user.role === "moderator") {
        navigate("/moderator", { replace: true });

      } else {
        navigate("/tickets", { replace: true });
      }

    }

  }, [navigate]);

  /* ================= INPUT HANDLER ================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

  };

  /* ================= LOGIN ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      const data = await api.login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful 🎉");

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
        onSubmit={handleSubmit}
        className="auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        <h2>Welcome Back 👋</h2>

        <p className="auth-sub">
          Login to continue
        </p>

        {/* EMAIL */}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="glass-input"
        />

        {/* PASSWORD */}

        <div className="password-wrapper">

          <input
            type={showPassword ? "text" : "password"}
            name="password"
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

        {/* FORGOT PASSWORD */}

        <p
          className="auth-link"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

        {/* BUTTON */}

        <motion.button
          type="submit"
          disabled={loading}
          className="glass-btn"
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          style={{
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        {/* SIGNUP */}

        <p className="auth-footer">

          Don’t have an account?

          <span onClick={() => navigate("/signup")}>
            Signup
          </span>

        </p>

      </motion.form>

    </div>

  );

}