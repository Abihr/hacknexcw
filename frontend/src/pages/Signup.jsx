import { useState } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/TraceX_logo.jpeg";
import "./Auth.css";

import { signup } from "../services/firebase/auth";
import { getFirebaseErrorMessage } from "../services/firebase/firebaseErrors";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    // Check passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signup(name, email, password);

      // Firebase automatically signs the user in
      navigate("/investigate");
    } catch (error) {
      setError(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}
      <div className="auth-brand">
        <img
          src={logo}
          alt="TraceX Logo"
          className="auth-logo"
        />

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

          {/* ERROR */}
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>

            {/* NAME */}
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* TERMS */}
            <label className="remember-me terms-check">
              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the Terms & Conditions
              </span>
            </label>

            {/* SIGNUP BUTTON */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          {/* LOGIN */}
          <div className="auth-switch">
            <span>Already have an account?</span>

            <button onClick={() => navigate("/login")}>
              Sign in
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

export default Signup;