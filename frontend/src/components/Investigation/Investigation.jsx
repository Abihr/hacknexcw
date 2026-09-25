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

        // ----------------------------------------------------
        // EVM WALLET VALIDATION
        // ----------------------------------------------------

        if (
            [
                "Ethereum",
                "BNB Chain",
                "Polygon",
                "Base Sepolia",
            ].includes(blockchain) &&
            !/^0x[a-fA-F0-9]{40}$/.test(trimmedWallet)
        ) {
            setError(
                `Invalid ${blockchain} wallet address. It should start with 0x and contain 40 hexadecimal characters.`
            );

            return;
        }

        // ----------------------------------------------------
        // BITCOIN WALLET VALIDATION
        // ----------------------------------------------------

        if (
            blockchain === "Bitcoin" &&
            !/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{20,87}$/.test(
                trimmedWallet
            )
        ) {
            setError("Invalid Bitcoin wallet address.");

            return;
        }

        // ----------------------------------------------------
        // SOLANA WALLET VALIDATION
        // ----------------------------------------------------

        if (
            blockchain === "Solana" &&
            !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(
                trimmedWallet
            )
        ) {
            setError("Invalid Solana wallet address.");

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
            // ------------------------------------------------
            // MAP FRONTEND BLOCKCHAIN NAME TO BACKEND VALUE
            // ------------------------------------------------

            const blockchainMap = {
                Bitcoin: "bitcoin",
                Ethereum: "ethereum",
                "BNB Chain": "bnb",
                Polygon: "polygon",
                "Base Sepolia": "base-sepolia",
                Solana: "solana",
            };

            const backendBlockchain =
                blockchainMap[blockchain] ||
                blockchain.toLowerCase();

            console.log(
                "=========================================="
            );

            console.log(
                "TRACE X FRONTEND ANALYSIS"
            );

            console.log(
                "=========================================="
            );

            console.log(
                "Wallet:",
                trimmedWallet
            );

            console.log(
                "Frontend blockchain:",
                blockchain
            );

            console.log(
                "Backend blockchain:",
                backendBlockchain
            );

            console.log(
                "Transaction:",
                transaction.trim() || "Not provided"
            );

            console.log(
                "=========================================="
            );

            // ------------------------------------------------
            // CALL ANALYSIS SERVICE
            // ------------------------------------------------

            const analysisData = await analyzeWallet({
                wallet: trimmedWallet,

                blockchain: backendBlockchain,

                transaction: transaction.trim(),
            });

            console.log(
                "TraceX analysis response:",
                analysisData
            );

            setResult(analysisData);

            setAnalysis(analysisData);
        } catch (err) {
            console.error(
                "TraceX frontend analysis error:",
                err
            );

            setError(
                err.message ||
                    "Something went wrong while analyzing the wallet."
            );
        } finally {
            clearInterval(loadingInterval);

            setLoading(false);
        }
    };

    return (
        <section
            className="investigation"
            id="investigate"
        >
            <div className="investigation-container">

                {/* ==================================================
                    HEADING
                ================================================== */}

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

                {/* ==================================================
                    INVESTIGATION FORM
                ================================================== */}

                <div className="investigation-card">

                    {/* WALLET */}

                    <div className="form-group">
                        <label htmlFor="wallet">
                            Suspect Wallet Address
                        </label>

                        <input
                            id="wallet"
                            type="text"
                            placeholder="Enter wallet address..."
                            value={wallet}
                            onChange={(e) =>
                                setWallet(e.target.value)
                            }
                        />
                    </div>

                    {/* BLOCKCHAIN */}

                    <div className="form-group">
                        <label htmlFor="blockchain">
                            Blockchain
                        </label>

                        <select
                            id="blockchain"
                            value={blockchain}
                            onChange={(e) =>
                                setBlockchain(e.target.value)
                            }
                        >
                            <option value="Ethereum">
                                Ethereum
                            </option>

                            <option value="Bitcoin">
                                Bitcoin
                            </option>

                            <option value="BNB Chain">
                                BNB Chain
                            </option>

                            <option value="Polygon">
                                Polygon
                            </option>

                            <option value="Base Sepolia">
                                Base Sepolia
                            </option>

                            <option value="Solana">
                                Solana
                            </option>
                        </select>
                    </div>

                    {/* TRANSACTION */}

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
                            onChange={(e) =>
                                setTransaction(e.target.value)
                            }
                        />
                    </div>

                    {/* ANALYZE BUTTON */}

                    <button
                        className="investigate-button"
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading
                            ? "Analyzing..."
                            : "Analyze Wallet"}

                        <span>
                            {loading ? "⏳" : "→"}
                        </span>
                    </button>

                    {/* ==================================================
                        LOADING
                    ================================================== */}

                    {loading && (
                        <div className="investigation-loading">

                            <div className="loading-header">
                                <span className="loading-pulse"></span>

                                <div>
                                    <strong>
                                        ANALYZING WALLET
                                    </strong>

                                    <p>
                                        {
                                            loadingMessages[
                                                loadingStep
                                            ]
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="loading-progress">
                                <div
                                    className="loading-progress-fill"
                                    style={{
                                        width: `${
                                            ((loadingStep + 1) /
                                                loadingMessages.length) *
                                            100
                                        }%`,
                                    }}
                                ></div>
                            </div>

                            <div className="loading-steps">
                                {loadingMessages.map(
                                    (message, index) => (
                                        <div
                                            key={message}
                                            className={
                                                index <= loadingStep
                                                    ? "loading-step active"
                                                    : "loading-step"
                                            }
                                        >
                                            <span>
                                                {index <= loadingStep
                                                    ? "✓"
                                                    : "○"}
                                            </span>

                                            {message}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <div className="investigation-error">
                            <span>⚠</span>

                            {error}
                        </div>
                    )}
                </div>

                {/* ==================================================
                    ANALYSIS RESULT
                ================================================== */}

                {result && (
                    <div className="investigation-result">

                        {/* RESULT HEADER */}

                        <div className="result-header">
                            <div>
                                <span className="section-label">
                                    ANALYSIS RESULT
                                </span>

                                <h3>
                                    Wallet Analysis Complete
                                </h3>
                            </div>

                            <span className="analysis-status">
                                ● ANALYZED
                            </span>
                        </div>

                        {/* ==================================================
                            RISK SCORE
                        ================================================== */}

                        <div className="risk-score-section">
                            <div className="risk-score-info">
                                <span>
                                    RISK SCORE
                                </span>

                                <strong>
                                    {result.riskScore ?? 0}

                                    <small>
                                        /100
                                    </small>
                                </strong>
                            </div>

                            <div className="risk-level">
                                {result.riskLevel ||
                                    "UNKNOWN"}
                            </div>
                        </div>

                        {/* RISK BAR */}

                        <div className="risk-bar">
                            <div
                                className="risk-bar-fill"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.max(
                                            0,
                                            Number(
                                                result.riskScore || 0
                                            )
                                        )
                                    )}%`,
                                }}
                            ></div>
                        </div>

                        {/* ==================================================
                            WALLET INFORMATION
                        ================================================== */}

                        <div className="result-wallet">
                            <span>
                                ANALYZED WALLET
                            </span>

                            <strong>
                                {result.wallet}
                            </strong>

                            <p>
                                {result.blockchain}
                                {" "}
                                Network
                            </p>
                        </div>

                        {/* ==================================================
                            STATISTICS
                        ================================================== */}

                        <div className="result-stats">

                            <div className="result-stat">
                                <span>
                                    TRANSACTIONS
                                </span>

                                <strong>
                                    {result.transactions ??
                                        result.fetchedTransactions ??
                                        0}
                                </strong>
                            </div>

                            <div className="result-stat">
                                <span>
                                    TRANSFER VOLUME
                                </span>

                                <strong>
                                    {result.volume ||
                                        "0"}
                                </strong>
                            </div>

                            <div className="result-stat">
                                <span>
                                    FUND FLOW HOPS
                                </span>

                                <strong>
                                    {result.hops ?? 0}
                                </strong>
                            </div>

                        </div>

                        {/* ==================================================
                            ENTITY
                        ================================================== */}

                        <div className="entity-section">
                            <span>
                                POTENTIAL ENTITY
                            </span>

                            <strong>
                                {result.entity ||
                                    "Unknown"}
                            </strong>
                        </div>

                        {/* ==================================================
                            RISK INDICATORS
                        ================================================== */}

                        <div className="indicators-section">
                            <span>
                                RISK INDICATORS
                            </span>

                            <div className="indicator-list">

                                {Array.isArray(
                                    result.indicators
                                ) &&
                                    result.indicators.map(
                                        (indicator, index) => (
                                            <div
                                                className="indicator"
                                                key={index}
                                            >
                                                <span>
                                                    ⚠
                                                </span>

                                                <p>
                                                    {indicator.description ||
                                                        indicator.title ||
                                                        "Risk indicator detected."}
                                                </p>
                                            </div>
                                        )
                                    )}

                                {(!result.indicators ||
                                    result.indicators.length ===
                                        0) && (
                                    <div className="indicator">
                                        <span>✓</span>

                                        <p>
                                            No additional risk indicators were reported.
                                        </p>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* ==================================================
                            TRANSACTION REFERENCE
                        ================================================== */}

                        <div className="transaction-reference">
                            <span>
                                TRANSACTION HASH
                            </span>

                            <strong>
                                {result.transaction ||
                                    "Not provided"}
                            </strong>
                        </div>

                    </div>
                )}

            </div>
        </section>
    );
}

export default Investigation;

