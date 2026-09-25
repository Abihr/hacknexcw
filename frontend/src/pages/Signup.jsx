import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/TraceX_logo.jpeg";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();

    // Demo signup for hackathon
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
          <h2>Create Account</h2>

          <p className="auth-subtitle">
            Create your TraceX investigation account.
          </p>

          <form onSubmit={handleSignup}>
            {/* NAME */}
            <div className="form-group">
              <label>Full Name</label>

              <input type="text" placeholder="Enter your full name" required />
            </div>

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
                  placeholder="Create a password"
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

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label>Confirm Password</label>

              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* TERMS */}
            <label className="remember-me terms-check">
              <input type="checkbox" required />

              <span>I agree to the Terms & Conditions</span>
            </label>

            {/* SIGNUP BUTTON */}
            <button type="submit" className="auth-submit">
              Create Account
            </button>
          </form>

          {/* LOGIN */}
          <div className="auth-switch">
            <span>Already have an account?</span>

            <button onClick={() => navigate("/login")}>Sign in</button>
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

export default Signup;
