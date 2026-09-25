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

                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    title={
                        theme === "light"
                            ? "Switch to dark mode"
                            : "Switch to light mode"
                    }
                >
                    {theme === "light" ? (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            />

                            <path
                                d="M12 2V4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M12 20V22"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M4.93 4.93L6.34 6.34"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M17.66 17.66L19.07 19.07"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M2 12H4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M20 12H22"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M4.93 19.07L6.34 17.66"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />

                            <path
                                d="M17.66 6.34L19.07 4.93"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    )}
                </button>

            </div>

        </header>
    );
}

export default LandingNavbar;