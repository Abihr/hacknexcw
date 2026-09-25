import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <a href="/" className="navbar-logo">
          <span className="logo-mark">
            <img src={logo} alt="TraceX Logo" />
          </span>

          <span className="logo-text">
            TRACE<span>//</span>X
          </span>
        </a>

        {/* Navigation */}
        <nav className="navbar-links">
          <a href="#overview">Overview</a>
          <a href="#investigate">Investigate</a>
          <a href="#dashboard">Dashboard</a>
        </nav>

        {/* Actions */}
        <div className="navbar-actions">

          {/* Theme */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            type="button"
          >
            {theme === "light" ? "☀️" : "🌙"}
          </button>

          {/* Profile */}
          <div className="profile-container">

            <button
              className="profile-button"
              type="button"
              onClick={() => setShowProfile(!showProfile)}
            >
              <span className="profile-icon">
                👤
              </span>

              <span className="profile-name">
                {user?.displayName || "Profile"}
              </span>
            </button>

            {showProfile && (
              <div className="profile-dropdown">

                <div className="profile-info">
                  <strong>
                    {user?.displayName || "TraceX User"}
                  </strong>

                  <span>
                    {user?.email}
                  </span>
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

        </div>
      </div>
    </header>
  );
}

export default Navbar;