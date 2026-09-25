import { useNavigate } from "react-router-dom";

function LandingHero() {
    const navigate = useNavigate();

    return (
        <section className="landing-hero">

            {/* LEFT SIDE */}
            <div className="landing-hero-content">

                <span className="hero-badge">
                    BLOCKCHAIN INTELLIGENCE PLATFORM
                </span>

                <h1>
                    Trace suspicious
                    <br />
                    <span>crypto transactions.</span>
                </h1>

                <p>
                    TraceX analyzes wallet activity, follows fund movement
                    across multiple addresses, and highlights potential
                    risk indicators through automated blockchain analysis.
                </p>

                <div className="hero-actions">

                    <button
                        className="primary-btn"
                        onClick={() => navigate("/investigate")}
                    >
                        Start Investigation
                    </button>

                    <a
                        href="#how-it-works"
                        className="secondary-btn"
                    >
                        How It Works
                    </a>

                </div>

            </div>


            {/* RIGHT SIDE — VISUAL ONLY */}
            <div className="landing-hero-visual">

                <div className="landing-hero-visual">

                    <div className="hero-video-card">

                        <div className="hero-video-header">
                            <span>
                                TRACEX // BLOCKCHAIN ANALYSIS
                            </span>

                            <span className="hero-video-status">
                                ● LIVE ANALYSIS
                            </span>
                        </div>

                        <div className="hero-video-wrapper">

                            <video
                                className="hero-video"
                                src="/TraceX/videos/tracex-intro.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                            />

                            <div className="hero-video-overlay">
                                <span>TRACE//X</span>
                            </div>

                        </div>

                        <div className="hero-video-footer">

                            <span>
                                Automated blockchain intelligence
                            </span>

                            <span>
                                4 HOPS DETECTED
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default LandingHero;