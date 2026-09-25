
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { useTheme } from "../../ThemeContext.jsx";
import { auth } from "../../services/firebase/firebase";
import { logout } from "../../services/firebase/auth";

function LandingNavbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Firebase authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log(
        "🔥 LANDING NAVBAR AUTH:",
        currentUser ? "LOGGED IN" : "LOGGED OUT"
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
    navigate("/", { replace: true });
  } catch (error) {
    console.error("🔥 LOGOUT ERROR:", error);
  }
};
  return (
    <header className="landing-navbar">
      <div className="landing-navbar-inner">

        {/* Logo */}
        <button
          className="landing-logo"
          onClick={() => navigate("/")}
          type="button"
        >
          Trace<span>X</span>
        </button>

        {/* Navigation */}
        <nav className="landing-nav">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </nav>

        {/* Authentication */}
        <div className="landing-auth-actions">

          {!user && (
            <>
              <button
                className="landing-login-button"
                onClick={() => navigate("/login")}
                type="button"
              >
                Log in
              </button>

              <button
                className="landing-signup-button"
                onClick={() => navigate("/signup")}
                type="button"
              >
                Sign up
              </button>
            </>
          )}

          {/* Right-side actions */}
          <div className="landing-nav-actions">

            {/* Theme */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              type="button"
            >
              {theme === "light" ? "☀️" : "🌙"}
            </button>

            {/* Investigate */}
            <button
              className="landing-nav-button"
              onClick={() => navigate("/investigate")}
              type="button"
            >
              Investigate
            </button>

            {/* Profile */}
            {user && (
              <div className="profile-container">

                <button
                  className="profile-button"
                  onClick={() => setShowProfile((prev) => !prev)}
                  type="button"
                >
                  <span className="profile-icon">👤</span>

                  <span className="profile-name">
                    {user.displayName ||
                      user.email?.split("@")[0] ||
                      "Profile"}
                  </span>
                </button>

                {showProfile && (
                  <div className="profile-dropdown">

                    <div className="profile-info">
                      <strong>
                        {user.displayName || "TraceX User"}
                      </strong>

                      <span>{user.email}</span>
                    </div>

                    <button
                      className="logout-button"
                      onClick={handleLogout}
                      type="button"
                    >
                      Logout
                    </button>

                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingNavbar;