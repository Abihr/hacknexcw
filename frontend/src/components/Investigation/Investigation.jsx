import { useState } from "react";
import { useInvestigation } from "../../InvestigationContext.jsx";
import "./Investigation.css";
import { analyzeWallet } from "../../services/analysisService.js";

function Investigation() {
    const [wallet, setWallet] = useState("");
    const [blockchain, setBlockchain] = useState("Ethereum");
    const [transaction, setTransaction] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loadingStep, setLoadingStep] = useState(0);
    const { setAnalysis } = useInvestigation();

    const loadingMessages = [
        "Connecting to blockchain network...",
        "Fetching transaction activity...",
        "Tracing fund movement...",
        "Running risk analysis...",
    ];

    const handleAnalyze = async () => {
        setError("");
        setResult(null);

        const trimmedWallet = wallet.trim();

        if (!trimmedWallet) {
            setError("Please enter a wallet address.");
            return;
        }

        // EVM wallet validation
        if (
            ["Ethereum", "BNB Chain", "Polygon"].includes(blockchain) &&
            !/^0x[a-fA-F0-9]{40}$/.test(trimmedWallet)
        ) {
            setError(
                `Invalid ${blockchain} wallet address. It should start with 0x and contain 40 hexadecimal characters.`
            );
            return;
        }

        // Basic Bitcoin validation
        if (
            blockchain === "Bitcoin" &&
            !/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{20,87}$/.test(trimmedWallet)
        ) {
            setError("Invalid Bitcoin wallet address.");
            return;
        }

        setLoading(true);
        setLoadingStep(0);

        const loadingInterval = setInterval(() => {
            setLoadingStep((currentStep) =>
                currentStep < loadingMessages.length - 1
                    ? currentStep + 1
                    : currentStep
            );
        }, 350);

        try {
            const analysisData = await analyzeWallet({
                wallet: trimmedWallet,
                blockchain,
                transaction: transaction.trim(),
            });

            setResult(analysisData);
            setAnalysis(analysisData);
        } catch (err) {
            setError(
                err.message || "Something went wrong while analyzing the wallet."
            );
        } finally {
            clearInterval(loadingInterval);
            setLoading(false);
        }
    };

    return (
        <section className="investigation" id="investigate">
            <div className="investigation-container">

                <div className="investigation-heading">
                    <span className="section-label">
                        INVESTIGATION
                    </span>

                    <h2>
                        Trace a suspicious
                        <span> wallet.</span>
                    </h2>

                    <p>
                        Enter a wallet address and investigate its
                        transaction activity across the blockchain.
                    </p>
                </div>

                <div className="investigation-card">

                    <div className="form-group">
                        <label htmlFor="wallet">
                            Suspect Wallet Address
                        </label>

                        <input
                            id="wallet"
                            type="text"
                            placeholder="Enter wallet address..."
                            value={wallet}
                            onChange={(e) => setWallet(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="blockchain">
                            Blockchain
                        </label>

                        <select
                            id="blockchain"
                            value={blockchain}
                            onChange={(e) => setBlockchain(e.target.value)}
                        >
                            <option>Ethereum</option>
                            <option>Bitcoin</option>
                            <option>BNB Chain</option>
                            <option>Polygon</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="transaction">
                            Transaction Hash
                            <span> Optional</span>
                        </label>

                        <input
                            id="transaction"
                            type="text"
                            placeholder="Enter transaction hash..."
                            value={transaction}
                            onChange={(e) => setTransaction(e.target.value)}
                        />
                    </div>

                    <button
                        className="investigate-button"
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? "Analyzing..." : "Analyze Wallet"}
                        <span>{loading ? "⏳" : "→"}</span>
                    </button>

                    {loading && (
                        <div className="investigation-loading">
                            <div className="loading-header">
                                <span className="loading-pulse"></span>
                                <div>
                                    <strong>ANALYZING WALLET</strong>
                                    <p>{loadingMessages[loadingStep]}</p>
                                </div>
                            </div>

                            <div className="loading-progress">
                                <div
                                    className="loading-progress-fill"
                                    style={{
                                        width: `${((loadingStep + 1) / loadingMessages.length) * 100}%`,
                                    }}
                                ></div>
                            </div>

                            <div className="loading-steps">
                                {loadingMessages.map((message, index) => (
                                    <div
                                        key={message}
                                        className={
                                            index <= loadingStep
                                                ? "loading-step active"
                                                : "loading-step"
                                        }
                                    >
                                        <span>{index <= loadingStep ? "✓" : "○"}</span>
                                        {message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="investigation-error">
                            <span>⚠</span>
                            {error}
                        </div>
                    )}

                </div>

                {result && (
                    <div className="investigation-result">

                        <div className="result-header">
                            <div>
                                <span className="section-label">
                                    ANALYSIS RESULT
                                </span>

                                <h3>Wallet Analysis Complete</h3>
                            </div>

                            <span className="analysis-status">
                                ● ANALYZED
                            </span>
                        </div>


                        {/* Risk Score */}

                        <div className="risk-score-section">

                            <div className="risk-score-info">
                                <span>RISK SCORE</span>

                                <strong>
                                    {result.riskScore}
                                    <small>/100</small>
                                </strong>
                            </div>

                            <div className="risk-level">
                                {result.riskLevel}
                            </div>

                        </div>


                        {/* Risk Progress Bar */}

                        <div className="risk-bar">
                            <div
                                className="risk-bar-fill"
                                style={{ width: `${result.riskScore}%` }}
                            ></div>
                        </div>


                        {/* Wallet Information */}

                        <div className="result-wallet">

                            <span>ANALYZED WALLET</span>

                            <strong>{result.wallet}</strong>

                            <p>
                                {result.blockchain} Network
                            </p>

                        </div>


                        {/* Statistics */}

                        <div className="result-stats">

                            <div className="result-stat">
                                <span>TRANSACTIONS</span>
                                <strong>{result.transactions}</strong>
                            </div>

                            <div className="result-stat">
                                <span>TRANSFER VOLUME</span>
                                <strong>{result.volume}</strong>
                            </div>

                            <div className="result-stat">
                                <span>FUND FLOW HOPS</span>
                                <strong>{result.hops}</strong>
                            </div>

                        </div>


                        {/* Entity */}

                        <div className="entity-section">

                            <span>POTENTIAL ENTITY</span>

                            <strong>
                                {result.entity}
                            </strong>

                        </div>


                        {/* Indicators */}

                        <div className="indicators-section">

                            <span>RISK INDICATORS</span>

                            <div className="indicator-list">

                                {result.indicators.map((indicator, index) => (
                                    <div
                                        className="indicator"
                                        key={index}
                                    >
                                        <span>⚠</span>
                                        <p>{indicator.description}</p>
                                    </div>
                                ))}

                            </div>

                        </div>


                        {/* Transaction */}

                        <div className="transaction-reference">

                            <span>TRANSACTION HASH</span>

                            <strong>
                                {result.transaction}
                            </strong>

                        </div>


                    </div>
                )}

            </div>
        </section>
    );
}

export default Investigation;