import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LoginModal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          "Authentication failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-full-page">
      <div className="login-container">
        <div className="login-content">
          <div className="login-header-brand">
            <div
              className="logo-square large"
              style={{ margin: "0 auto 32px" }}
            >
              <span className="logo-letter">LC</span>
            </div>
            <h1>{isLogin ? "Log in" : "Create an account"}</h1>
            <p
              className="text-muted"
              style={{ fontSize: "1.1rem", marginTop: "12px" }}
            >
              {isLogin
                ? "Welcome back to your workspace."
                : "Start your productivity journey today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form-editorial">
            <div className="form-group-editorial">
              <label>Username</label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group-editorial">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="login-error-pill"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="btn-primary-login"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="spin" size={22} />
              ) : (
                <>
                  <span>{isLogin ? "Continue" : "Sign up"}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="login-switch">
            <p>
              {isLogin ? "Welcome to the Platform!" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-link-editorial"
              >
                {isLogin ? "Create one now" : "Log in here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
