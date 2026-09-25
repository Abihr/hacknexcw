import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/TraceX_logo.jpeg";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    // Demo login for hackathon
    navigate("/investigate");
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE */}
      <div className="auth-brand">
        <img src={logo} alt="TraceX Logo" className="auth-logo" />

        <h1>TraceX</h1>

        <p>Blockchain Intelligence Platform</p>

        <span>Investigate. Trace. Identify.</span>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-form-container">
        <div className="auth-card">
          <h2>Welcome Back</h2>

          <p className="auth-subtitle">
            Sign in to continue your investigation.
          </p>

          <form onSubmit={handleLogin}>
            {/* EMAIL */}
            <div className="form-group">
              <label>Email</label>

              <input type="email" placeholder="Enter your email" required />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button type="submit" className="auth-submit">
              Sign In
            </button>
          </form>

          {/* SIGNUP */}
          <div className="auth-switch">
            <span>Don't have an account?</span>

            <button onClick={() => navigate("/signup")}>Create account</button>
          </div>

          {/* BACK */}
          <button className="back-home" onClick={() => navigate("/")}>
            ← Back to TraceX
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
