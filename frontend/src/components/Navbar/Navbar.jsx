import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { useTheme } from "../../ThemeContext.jsx";
import { auth } from "../../services/firebase/firebase";
import { logout } from "../../services/firebase/auth";

import "./Navbar.css";
import logo from "../../assets/TraceX_logo.jpeg";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(
        "🔥 NAVBAR AUTH STATE:",
        currentUser ? "LOGGED IN" : "LOGGED OUT",
      );

      console.log("🔥 CURRENT UID:", currentUser?.uid || "NONE");

      setUser(currentUser);
      setShowProfile(false);
    });

    return unsubscribe;
  }, []);

  // Logout
  const handleLogout = async () => {
    console.log("🔥 LOGOUT CLICKED");

    try {
      await logout();

      console.log(
        "🔥 AFTER SIGNOUT:",
        auth.currentUser ? auth.currentUser.uid : "NULL",
      );

      setUser(null);
      setShowProfile(false);

      // Go to the default landing page
      window.location.replace("/");
    } catch (error) {
      console.error("🔥 LOGOUT ERROR:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-mark">
            <img src={logo} alt="TraceX Logo" />
          </span>

          <span className="logo-text">
            TRACE<span>//</span>X
          </span>
        </Link>

        {/* Navigation */}
        <nav className="navbar-links">
          <Link to="/#overview">Overview</Link>
          <Link to="/#investigate">Investigate</Link>
          <Link to="/#dashboard">Dashboard</Link>
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            type="button"
          >
            {theme === "light" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 2V5M12 19V22M4.93 4.93L7.05 7.05M16.95 16.95L19.07 19.07M2 12H5M19 12H22M4.93 19.07L7.05 16.95M16.95 7.05L19.07 4.93"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 A8.5 8.5 0 1 0 20.5 14.2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                <circle cx="20" cy="9.5" r="0.7" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Authentication / Profile */}
          {user ? (
            <div className="profile-container">
              <button
                className="profile-button"
                type="button"
                onClick={() => setShowProfile((prev) => !prev)}
              >
                <span className="profile-icon">👤</span>

                <span className="profile-name">
                  {user.displayName || user.email?.split("@")[0] || "Profile"}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <strong>
                      {user.displayName ||
                        user.email?.split("@")[0] ||
                        "TraceX User"}
                    </strong>

                    <span>{user.email}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="login-button"
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
