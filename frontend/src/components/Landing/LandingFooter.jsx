import { useNavigate } from "react-router-dom";
import "./LandingFooter.css";

function LandingFooter() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <>
      <footer className="tracex-footer">
        {/* Decorative Glow Effects */}
        <div className="footer-glow footer-glow-left"></div>
        <div className="footer-glow footer-glow-right"></div>

        <div className="tracex-footer-container">
          {/* Footer Columns */}
          <div className="tracex-footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <h2>TRACEX</h2>

              <p>
                Real-time blockchain intelligence for tracing suspicious
                transactions, analyzing wallet activity, and identifying
                fraud-linked entities.
              </p>

              <span className="footer-tagline">
                Investigate. Trace. Identify.
              </span>
            </div>

            {/* Explore */}
            <div className="footer-column">
              <h3>Explore</h3>

              <button onClick={() => scrollToSection("features")}>
                Features
              </button>

              <button onClick={() => scrollToSection("how-it-works")}>
                How It Works
              </button>

              <button onClick={() => scrollToSection("faq")}>FAQ</button>

              <button onClick={() => navigate("/investigate")}>
                Investigation
              </button>
            </div>

            {/* Legal */}
            <div className="footer-column">
              <h3>Legal</h3>

              <button>Privacy Policy</button>
              <button>Terms of Service</button>
              <button>Cookie Policy</button>
              <button>Security</button>
            </div>

            {/* Stay Updated */}
            <div className="footer-column footer-newsletter">
              <h3>Stay Updated</h3>

              <p>
                Subscribe for the latest TraceX updates, blockchain
                intelligence, and platform news.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="footer-subscribe"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address"
                  required
                />

                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p>© 2026 TraceX. All rights reserved.</p>

            <div className="footer-socials">
              <a
                href="#"
                aria-label="Instagram"
                className="social-link instagram"
              >
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" className="social-fill" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="social-link facebook"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.7.3-1 1-1Z" />
                </svg>
              </a>

              <a
                href="#"
                aria-label="X Twitter"
                className="social-link twitter"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M18.2 3H21l-6.1 7 7.2 11H16.5l-4.5-6.8L6 21H3.2l6.5-7.5L2.8 3h5.8l4.1 6.1L18.2 3Zm-1 16h1.6L7.4 4.9H5.7L17.2 19Z" />
                </svg>
              </a>

              <a
                href="mailto:hello@tracex.com"
                aria-label="Email"
                className="social-link email"
              >
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Giant Moving TraceX Text */}
      <div className="footer-marquee">
        <div className="footer-marquee-track">
          <span>TRACEX</span>
          <span>TRACEX</span>
          <span>TRACEX</span>
          <span>TRACEX</span>
          <span>TRACEX</span>
          <span>TRACEX</span>
        </div>
      </div>
    </>
  );
}

export default LandingFooter;
