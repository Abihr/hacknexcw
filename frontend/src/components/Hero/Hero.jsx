import "./Hero.css";

function Hero() {
  return (
    <section className="hero" id="overview">
      <div className="hero-container">

        <div className="hero-content">

          <div className="hero-badge">
            <span className="status-dot"></span>
            BLOCKCHAIN FRAUD INTELLIGENCE
          </div>

          <h1>
            Follow the money.
            <br />
            <span>Find the exit.</span>
          </h1>

          <p className="hero-description">
            TRACE//X analyzes suspicious cryptocurrency wallet activity,
            traces fund movement across multiple hops, and identifies
            potential fraud-linked entities.
          </p>

          <div className="hero-actions">
            <a
              href="#investigate"
              className="hero-button hero-button-primary"
            >
              Start Investigation
              <span>→</span>
            </a>

            <button className="hero-button hero-button-secondary">
              Explore Demo
            </button>
          </div>

          <div className="hero-meta">
            <div>
              <span className="meta-number">100%</span>
              <span className="meta-label">Traceable</span>
            </div>

            <div>
              <span className="meta-number">Multi-hop</span>
              <span className="meta-label">Analysis</span>
            </div>

            <div>
              <span className="meta-number">0–100</span>
              <span className="meta-label">Risk Score</span>
            </div>
          </div>

        </div>

        <div className="hero-visual">
          <div className="network-card">

            <div className="network-header">
              <span>LIVE NETWORK</span>
              <span className="live-indicator">● ONLINE</span>
            </div>

            <div className="network-graph">

              <div className="network-node node-center">
                <span>TX</span>
              </div>

              <div className="network-node node-one">
                <span>W1</span>
              </div>

              <div className="network-node node-two">
                <span>W2</span>
              </div>

              <div className="network-node node-three">
                <span>EX</span>
              </div>

              <div className="connection connection-one"></div>
              <div className="connection connection-two"></div>
              <div className="connection connection-three"></div>

            </div>

            <div className="network-footer">
              <span>TRANSACTION FLOW</span>
              <span>04 HOPS</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;