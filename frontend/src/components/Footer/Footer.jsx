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
                        Blockchain intelligence for tracing suspicious
                        cryptocurrency activity and following the flow of funds.
                    </p>

                    <span className="footer-tagline">
                        FOLLOW THE MONEY. FIND THE EXIT.
                    </span>

                </div>


                {/* Navigation */}

                <div className="footer-column">

                    <h4>PLATFORM</h4>

                    <a href="#overview">Overview</a>
                    <a href="#investigate">Investigate</a>
                    <a href="#dashboard">Dashboard</a>
                    <a href="#fund-flow">Fund Flow</a>

                </div>


                {/* Intelligence */}

                <div className="footer-column">

                    <h4>INTELLIGENCE</h4>

                    <a href="#investigate">Wallet Analysis</a>
                    <a href="#dashboard">Risk Analysis</a>
                    <a href="#fund-flow">Transaction Flow</a>

                </div>


                {/* Status */}

                <div className="footer-column footer-status">

                    <h4>SYSTEM</h4>

                    <div className="footer-system-status">
                        <span></span>
                        System Operational
                    </div>

                    <p>
                        Blockchain intelligence platform
                    </p>

                    <span className="footer-version">
                        TRACE//X v0.1
                    </span>

                </div>

            </div>


            {/* Bottom */}

            <div className="footer-bottom">

                <p>
                    © 2026 TRACE//X. Built for blockchain intelligence.
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