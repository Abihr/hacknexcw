
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
        currentUser ? "LOGGED IN" : "LOGGED OUT"
      );

      console.log(
        "🔥 CURRENT UID:",
        currentUser?.uid || "NONE"
      );

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
        auth.currentUser ? auth.currentUser.uid : "NULL"
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
            {theme === "light" ? "☀️" : "🌙"}
          </button>

          {/* Authentication / Profile */}
          {user ? (
            <div className="profile-container">

              <button
                className="profile-button"
                type="button"
                onClick={() =>
                  setShowProfile((prev) => !prev)
                }
              >
                <span className="profile-icon">👤</span>

                <span className="profile-name">
                  {user.displayName ||
                    user.email?.split("@")[0] ||
                    "Profile"}
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

