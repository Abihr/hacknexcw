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

        if (
            blockchain === "Bitcoin" &&
            !/^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{20,87}$/.test(
                trimmedWallet
            )
        ) {
            setError("Invalid Bitcoin wallet address.");
            return;
        }

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
            console.log("TRACE X FRONTEND ANALYSIS");
            console.log(
                "=========================================="
            );
            console.log("Wallet:", trimmedWallet);
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

            const analysisData = await analyzeWallet({
                wallet: trimmedWallet,
                blockchain: backendBlockchain,
                transaction: transaction.trim(),
            });

            console.log(
                "TraceX analysis response:",
                analysisData
            );

            const transactionCount = Array.isArray(
                analysisData?.transactions
            )
                ? analysisData.transactions.length
                : Number(
                      analysisData?.fetchedTransactions ??
                          analysisData?.transactionCount ??
                          analysisData?.transactions ??
                          0
                  );

            const fundFlowHops = Array.isArray(
                analysisData?.fundFlow
            )
                ? analysisData.fundFlow.length
                : analysisData?.fundFlow &&
                  typeof analysisData.fundFlow === "object"
                ? Array.isArray(
                      analysisData.fundFlow.edges
                  )
                    ? analysisData.fundFlow.edges.length
                    : 0
                : Number(analysisData?.hops ?? 0);

            const riskIndicators = Array.isArray(
                analysisData?.indicators
            )
                ? analysisData.indicators
                : Array.isArray(
                      analysisData?.riskFactors
                  )
                ? analysisData.riskFactors.map(
                      (factor) => ({
                          description:
                              typeof factor ===
                              "string"
                                  ? factor
                                  : factor?.description ||
                                    factor?.title ||
                                    "Risk factor detected.",
                      })
                  )
                : [];

            const safeAnalysisData = {
                ...analysisData,
                transactions: transactionCount,
                transactionCount: transactionCount,
                fetchedTransactions:
                    analysisData?.fetchedTransactions ??
                    transactionCount,
                hops: fundFlowHops,
                indicators: riskIndicators,
            };

            setResult(analysisData);
            setAnalysis(safeAnalysisData);
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

    const transactionCount = Array.isArray(
        result?.transactions
    )
        ? result.transactions.length
        : Number(
              result?.fetchedTransactions ??
                  result?.transactionCount ??
                  result?.transactions ??
                  0
          );

    const transferVolume =
        result?.volume ??
        result?.totalVolume ??
        (
            result?.totalSent !== undefined ||
            result?.totalReceived !== undefined
                ? `${Number(
                      result?.totalSent || 0
                  ).toFixed(4)} / ${Number(
                      result?.totalReceived || 0
                  ).toFixed(4)}`
                : "0"
        );

    const fundFlowHops =
        result?.hops ??
        (
            Array.isArray(result?.fundFlow)
                ? result.fundFlow.length
                : result?.fundFlow &&
                  typeof result.fundFlow === "object"
                ? Array.isArray(
                      result.fundFlow.edges
                  )
                    ? result.fundFlow.edges.length
                    : 0
                : 0
        );

    const riskIndicators = Array.isArray(
        result?.indicators
    )
        ? result.indicators
        : Array.isArray(result?.riskFactors)
        ? result.riskFactors.map((factor) => ({
              description:
                  typeof factor === "string"
                      ? factor
                      : factor?.description ||
                        factor?.title ||
                        "Risk factor detected.",
          }))
        : [];

    const transactionHash =
        typeof result?.transaction === "string"
            ? result.transaction
            : Array.isArray(result?.transactions) &&
              result.transactions.length > 0
            ? result.transactions[0]?.txid ||
              result.transactions[0]?.hash ||
              null
            : null;

    return (
        <section
            className="investigation"
            id="investigate"
        >
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
                        Enter a wallet address and investigate
                        its transaction activity across the
                        blockchain.
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
                            onChange={(e) =>
                                setWallet(e.target.value)
                            }
                        />
                    </div>

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
                                setTransaction(
                                    e.target.value
                                )
                            }
                        />
                    </div>

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
                                            ((loadingStep +
                                                1) /
                                                loadingMessages.length) *
                                            100
                                        }%`,
                                    }}
                                ></div>
                            </div>

                            <div className="loading-steps">
                                {loadingMessages.map(
                                    (
                                        message,
                                        index
                                    ) => (
                                        <div
                                            key={message}
                                            className={
                                                index <=
                                                loadingStep
                                                    ? "loading-step active"
                                                    : "loading-step"
                                            }
                                        >
                                            <span>
                                                {index <=
                                                loadingStep
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

                                <h3>
                                    Wallet Analysis Complete
                                </h3>
                            </div>

                            <span className="analysis-status">
                                ● ANALYZED
                            </span>
                        </div>

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

                        <div className="risk-bar">
                            <div
                                className="risk-bar-fill"
                                style={{
                                    width: `${Math.min(
                                        100,
                                        Math.max(
                                            0,
                                            Number(
                                                result.riskScore ||
                                                    0
                                            )
                                        )
                                    )}%`,
                                }}
                            ></div>
                        </div>

                        <div className="result-wallet">
                            <span>
                                ANALYZED WALLET
                            </span>

                            <strong>
                                {result.wallet}
                            </strong>

                            <p>
                                {result.blockchain} Network
                            </p>
                        </div>

                        <div className="result-stats">
                            <div className="result-stat">
                                <span>
                                    TRANSACTIONS
                                </span>

                                <strong>
                                    {transactionCount}
                                </strong>
                            </div>

                            <div className="result-stat">
                                <span>
                                    TRANSFER VOLUME
                                </span>

                                <strong>
                                    {transferVolume}
                                </strong>
                            </div>

                            <div className="result-stat">
                                <span>
                                    FUND FLOW HOPS
                                </span>

                                <strong>
                                    {fundFlowHops}
                                </strong>
                            </div>
                        </div>

                        <div className="entity-section">
                            <span>
                                POTENTIAL ENTITY
                            </span>

                            <strong>
                                {typeof result.entity ===
                                "string"
                                    ? result.entity
                                    : "Unknown"}
                            </strong>
                        </div>

                        <div className="indicators-section">
                            <span>
                                RISK INDICATORS
                            </span>

                            <div className="indicator-list">
                                {riskIndicators.length >
                                0 ? (
                                    riskIndicators.map(
                                        (
                                            indicator,
                                            index
                                        ) => (
                                            <div
                                                className="indicator"
                                                key={index}
                                            >
                                                <span>
                                                    ⚠
                                                </span>

                                                <p>
                                                    {typeof indicator ===
                                                    "string"
                                                        ? indicator
                                                        : indicator?.description ||
                                                          indicator?.title ||
                                                          "Risk indicator detected."}
                                                </p>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className="indicator">
                                        <span>✓</span>

                                        <p>
                                            No additional
                                            risk indicators
                                            were reported.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="transaction-reference">
                            <span>
                                TRANSACTION HASH
                            </span>

                            <strong>
                                {transactionHash ||
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