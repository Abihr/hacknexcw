import { useInvestigation } from "../../InvestigationContext.jsx";
import "./Dashboard.css";

function Dashboard() {
    const { analysis } = useInvestigation();
    const hasAnalysis = Boolean(analysis);

    return (
        <section className="dashboard" id="dashboard">
            <div className="dashboard-container">

                {/* Section Heading */}

                <div className="dashboard-heading">

                    <span className="section-label">
                        INTELLIGENCE DASHBOARD
                    </span>

                    <h2>
                        See the bigger
                        <span> picture.</span>
                    </h2>

                    <p>
                        Analyze wallet activity, transaction patterns,
                        fund movement and potential risk indicators.
                    </p>

                </div>


                {/* ========= */}

                {!hasAnalysis && (
                    <div className="dashboard-empty">
                        <div className="dashboard-empty-icon">
                            ◈
                        </div>

                        <span className="section-label">
                            NO INVESTIGATION DATA
                        </span>

                        <h3>
                            Your intelligence dashboard is waiting.
                        </h3>

                        <p>
                            Start an investigation above to populate risk,
                            transaction, fund-flow, and entity intelligence.
                        </p>

                        <a
                            href="#investigate"
                            className="dashboard-empty-button"
                        >
                            Start Investigation
                            <span>→</span>
                        </a>
                    </div>
                )}

                {/* ========= */}





                {/* Dashboard Grid */}

                {hasAnalysis && (

                    <div className="dashboard-grid">
                        {/* Investigation Summary */}

                        <div className="dashboard-card dashboard-summary-card">

                            <div className="summary-header">
                                <div>
                                    <span className="dashboard-card-label">
                                        INVESTIGATION SUMMARY
                                    </span>

                                    <h3>
                                        Wallet intelligence overview
                                    </h3>
                                </div>

                                <span className="summary-status">
                                    ● ANALYZED
                                </span>
                            </div>

                            <div className="summary-wallet">
                                <span>ANALYZED WALLET</span>

                                <strong>
                                    {analysis?.wallet ?? "—"}
                                </strong>
                            </div>

                            <div className="summary-details">

                                <div>
                                    <span>NETWORK</span>
                                    <strong>
                                        {analysis?.blockchain ?? "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>RISK</span>
                                    <strong>
                                        {analysis?.riskLevel ?? "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>ENTITY</span>
                                    <strong>
                                        {analysis?.entity ?? "—"}
                                    </strong>
                                </div>

                            </div>

                            <div className="summary-stats">

                                <div>
                                    <strong>{analysis?.transactions ?? "--"}</strong>
                                    <span>Transactions</span>
                                </div>

                                <div>
                                    <strong>{analysis?.hops ?? "--"}</strong>
                                    <span>Fund Flow Hops</span>
                                </div>

                                <div>
                                    <strong>{analysis?.volume ?? "--"}</strong>
                                    <span>Transfer Volume</span>
                                </div>

                            </div>

                        </div>


                        {/* Risk Score */}

                        <div
                            className="dashboard-card risk-card"
                            style={{
                                "--risk-score": analysis?.riskScore ?? 0,
                            }}
                        >

                            <div className="risk-card-header">
                                <span className="dashboard-card-label">
                                    RISK SCORE
                                </span>

                                <span className="risk-card-badge">
                                    AI ANALYSIS
                                </span>
                            </div>

                            <div className="risk-gauge">

                                <div className="risk-gauge-ring">
                                    <div className="risk-gauge-inner">
                                        <strong>
                                            {analysis?.riskScore ?? "--"}
                                        </strong>

                                        <span>/100</span>
                                    </div>
                                </div>

                            </div>

                            <div className="risk-card-meta">
                                <p className="risk-card-status">
                                    {analysis?.riskLevel ?? "NO ANALYSIS"}
                                </p>

                                <span className="risk-card-description">
                                    Threat assessment
                                </span>
                            </div>

                            <div className="dashboard-progress">
                                <div
                                    className="dashboard-progress-fill"
                                    style={{
                                        width: `${analysis?.riskScore ?? 0}%`,
                                    }}
                                ></div>
                            </div>

                        </div>


                        {/* Transactions */}

                        <div className="dashboard-card">

                            <span className="dashboard-card-label">
                                TRANSACTIONS
                            </span>

                            <strong className="dashboard-number">
                                {analysis?.transactions ?? "--"}
                            </strong>

                            <p>
                                Total transactions analyzed
                            </p>

                        </div>


                        {/* Transfer Volume */}

                        <div className="dashboard-card">

                            <span className="dashboard-card-label">
                                TRANSFER VOLUME
                            </span>

                            <strong className="dashboard-number">
                                {analysis?.volume ?? "--"}
                            </strong>

                            <p>
                                Estimated transaction volume
                            </p>

                        </div>


                        {/* Fund Flow */}

                        <div className="dashboard-card">

                            <span className="dashboard-card-label">
                                FUND FLOW HOPS
                            </span>

                            <strong className="dashboard-number">
                                {analysis?.hops ?? "--"}
                            </strong>

                            <p>
                                Detected movement across the network
                            </p>

                        </div>


                        {/* Entity Detection */}

                        <div className="dashboard-card dashboard-card-wide">

                            <span className="dashboard-card-label">
                                POTENTIAL ENTITY
                            </span>

                            <strong className="dashboard-entity">
                                {analysis?.entity ?? "No entity detected"}
                            </strong>

                            <p>
                                Entity classification based on observed
                                transaction behaviour.
                            </p>

                        </div>


                        {/* Network Status */}

                        <div className="dashboard-card dashboard-card-wide">

                            <span className="dashboard-card-label">
                                NETWORK
                            </span>

                            <div className="network-status-row">

                                <span className="network-status-dot"></span>

                                <strong>
                                    {analysis?.blockchain ?? "—"}
                                </strong>

                                <span className="network-status-text">
                                    ACTIVE
                                </span>

                            </div>

                            <p>
                                Blockchain selected for this investigation.
                            </p>

                        </div>
                    </div>
                )}

            </div>
        </section>
    );
}

export default Dashboard;