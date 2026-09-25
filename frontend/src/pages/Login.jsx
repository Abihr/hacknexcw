import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authVisual from "../assets/tracex_login-signup.png";
import "./Auth.css";

import { login } from "../services/firebase/auth";
import { getFirebaseErrorMessage } from "../services/firebase/firebaseErrors";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);

      // Login successful
      navigate("/investigate");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-visual">
        <img
          src={authVisual}
          alt="TraceX Blockchain Intelligence"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-form-container">
        <div className="auth-card">

          <h2>Welcome Back</h2>

          <p className="auth-subtitle">
            Sign in to continue your investigation.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="auth-options">

              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* SIGNUP */}
          <div className="auth-switch">
            <span>Don't have an account?</span>

            <button onClick={() => navigate("/signup")}>
              Create account
            </button>
          </div>

          {/* BACK */}
          <button
            className="back-home"
            onClick={() => navigate("/")}
          >
            ← Back to TraceX
          </button>

        </div>
      </div>

    </div>
  );
}

export default Login;