import { useNavigate } from "react-router-dom";

function LandingCTA() {
    const navigate = useNavigate();

    return (
        <section className="landing-cta">

            <div className="cta-content">

                <span className="cta-badge">
                    READY TO INVESTIGATE?
                </span>

                <h2>
                    Turn blockchain activity
                    <br />
                    into actionable insight.
                </h2>

                <p>
                    Start an investigation with a suspicious wallet address
                    and explore its transaction activity, fund movement,
                    risk indicators, and connected entities.
                </p>

                <button
                    className="primary-btn cta-button"
                    onClick={() => navigate("/investigate")}
                >
                    Start Investigation
                    <span>→</span>
                </button>

            </div>

        </section>
    );
}

export default LandingCTA;