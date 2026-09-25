import { useNavigate } from "react-router-dom";
import { useTheme } from "../../ThemeContext.jsx";

function LandingNavbar() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="landing-navbar">
            <div className="landing-logo">
                Trace<span>X</span>
            </div>

            <nav className="landing-nav">
                <a href="#how-it-works">How It Works</a>
                <a href="#features">Features</a>
                <a href="#faq">FAQ</a>
            </nav>

            <div className="landing-auth-actions">

                <button
                    className="landing-login-button"
                    onClick={() => navigate("/login")}
                >
                    Log in
                </button>

                <button
                    className="landing-signup-button"
                    onClick={() => navigate("/signup")}
                >
                    Sign up
                </button>

                <div className="landing-nav-actions">

                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === "light" ? "☀️" : "🌙"}
                    </button>

                    <button
                        className="landing-nav-button"
                        onClick={() => navigate("/investigate")}
                    >
                        Investigate
                    </button>

                </div>

            </div>
        </header>
    );
}

export default LandingNavbar;