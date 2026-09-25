import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <span className="footer-logo-mark">T</span>

            <span className="footer-logo-text">
              TRACE<span>//</span>X
            </span>
          </a>

          <p>
            AI-powered blockchain intelligence for investigating cryptocurrency
            fraud, tracing suspicious transactions, and uncovering the movement
            of digital assets.
          </p>

          <span className="footer-tagline">
            TRACE THE FLOW. UNCOVER THE NETWORK.
          </span>
        </div>

        {/* Platform */}
        <div className="footer-column">
          <h4>PLATFORM</h4>

          <a href="#overview">Overview</a>
          <a href="#investigate">Investigate</a>
          <a href="#dashboard">Investigation Dashboard</a>
          <a href="#fund-flow">Fund Flow</a>
          <a href="#reports">Investigation Reports</a>
        </div>

        {/* Intelligence */}
        <div className="footer-column">
          <h4>INTELLIGENCE</h4>

          <a href="#investigate">Wallet Analysis</a>
          <a href="#transactions">Transaction Analysis</a>
          <a href="#fund-flow">Fund Tracing</a>
          <a href="#risk">Risk Analysis</a>
          <a href="#entities">Entity Identification</a>
        </div>

        {/* System */}
        <div className="footer-column footer-status">
          <h4>SYSTEM</h4>

          <div className="footer-system-status">
            <span></span>
            System Operational
          </div>

          <p>
            Automated blockchain investigation and cryptocurrency intelligence.
          </p>

          <span className="footer-version">TRACE//X v0.1</span>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>
          © 2026 TRACE//X. Blockchain intelligence &amp; fraud investigation
          platform.
        </p>

        <div className="footer-bottom-links">
          <a href="#overview">Privacy</a>
          <a href="#overview">Terms</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
