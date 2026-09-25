import { useTheme } from "../../ThemeContext.jsx";
import "./Navbar.css";
import logo from "../../assets/TraceX_logo.jpeg";

function Navbar() {
  const { theme, toggleTheme } = useTheme();

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
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            type="button"
          >
            {theme === "light" ? "☀️" : "🌙"}
          </button>
        </div>

      </div>
    </header>
  );
}

export default Navbar;