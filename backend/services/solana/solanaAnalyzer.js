const {
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
} = require("@solana/web3.js");

const SOLANA_RPC_URL =
    process.env.SOLANA_RPC_URL ||
    "https://api.mainnet-beta.solana.com";

const MAX_TRANSACTIONS = 20;

function getConnection() {
    return new Connection(SOLANA_RPC_URL, "confirmed");
}

function formatSOL(lamports) {
    return lamports / LAMPORTS_PER_SOL;
}

function shortenAddress(address) {
    if (!address || address.length < 12) {
        return address;
    }

    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

/**
 * Fetch recent transaction signatures for a Solana wallet.
 *
 * Solana RPC returns signatures in pages. We fetch up to
 * MAX_TRANSACTIONS so the API remains reasonably fast.
 */
async function getSignatures(connection, publicKey) {
    const signatures = [];
    let before = undefined;

    while (signatures.length < MAX_TRANSACTIONS) {
        const remaining = MAX_TRANSACTIONS - signatures.length;

        const batch = await connection.getSignaturesForAddress(
            publicKey,
            {
                limit: Math.min(1000, remaining),
                ...(before ? { before } : {}),
            }
        );

        if (!batch.length) {
            break;
        }

        signatures.push(...batch);

        if (batch.length < Math.min(1000, remaining)) {
            break;
        }

        before = batch[batch.length - 1].signature;
    }

    return signatures;
}

/**
 * Identify the main SOL transfer involving the investigated wallet.
 */
function findSOLTransfer(transaction, walletAddress) {
    const instructions =
        transaction?.transaction?.message?.instructions || [];

    for (const instruction of instructions) {
        if (
            instruction?.program === "system" &&
            instruction?.parsed?.type === "transfer"
        ) {
            const info = instruction.parsed.info;

            if (!info?.source || !info?.destination) {
                continue;
            }

            const source = info.source;
            const destination = info.destination;
            const lamports = Number(info.lamports || 0);

            if (
                source === walletAddress ||
                destination === walletAddress
            ) {
                let direction = "UNKNOWN";

                if (
                    source === walletAddress &&
                    destination === walletAddress
                ) {
                    direction = "SELF_TRANSFER";
                } else if (source === walletAddress) {
                    direction = "SENT";
                } else if (destination === walletAddress) {
                    direction = "RECEIVED";
                }

                return {
                    from: source,
                    to: destination,
                    lamports,
                    value: formatSOL(lamports),
                    direction,
                    asset: "SOL",
                    type: "native",
                };
            }
        }
    }

    return null;
}

/**
 * Determine whether the wallet participated in the transaction
 * and calculate its net SOL balance movement.
 *
 * This is useful for transactions involving programs where there
 * may not be a simple System Program transfer instruction.
 */
function getWalletBalanceChange(transaction, walletAddress) {
    const message =
        transaction?.transaction?.message;

    const accountKeys = message?.accountKeys || [];

    const walletIndex = accountKeys.findIndex((key) => {
        if (typeof key === "string") {
            return key === walletAddress;
        }

        return (
            key?.pubkey === walletAddress ||
            key?.toString?.() === walletAddress
        );
    });

    if (walletIndex === -1) {
        return null;
    }

    const preBalances =
        transaction?.meta?.preBalances || [];

    const postBalances =
        transaction?.meta?.postBalances || [];

    if (
        preBalances[walletIndex] === undefined ||
        postBalances[walletIndex] === undefined
    ) {
        return null;
    }

    const pre = Number(preBalances[walletIndex]);
    const post = Number(postBalances[walletIndex]);

    const fee =
        walletIndex === 0
            ? Number(transaction?.meta?.fee || 0)
            : 0;

    const netChange = post - pre;

    return {
        netChange,
        pre,
        post,
        fee,
    };
}

/**
 * Extract program names used by the transaction.
 */
function getPrograms(transaction) {
    const instructions =
        transaction?.transaction?.message?.instructions || [];

    const programs = new Set();

    for (const instruction of instructions) {
        if (instruction?.program) {
            programs.add(instruction.program);
        }

        if (instruction?.programId) {
            programs.add(
                instruction.programId.toString()
            );
        }
    }

    return Array.from(programs);
}

/**
 * Normalize one Solana transaction into TraceX's common format.
 */
function normalizeTransaction(
    signatureInfo,
    transaction,
    walletAddress
) {
    const signature =
        signatureInfo.signature;

    const timestamp =
        signatureInfo.blockTime
            ? signatureInfo.blockTime * 1000
            : null;

    const slot =
        signatureInfo.slot || null;

    const failed =
        Boolean(signatureInfo.err);

    const feeLamports =
        Number(transaction?.meta?.fee || 0);

    const transfer =
        findSOLTransfer(
            transaction,
            walletAddress
        );

    const balanceChange =
        getWalletBalanceChange(
            transaction,
            walletAddress
        );

    const programs =
        getPrograms(transaction);

    let direction = "UNKNOWN";
    let from = walletAddress;
    let to = walletAddress;
    let value = 0;
    let valueLamports = 0;
    let asset = "SOL";
    let type = "program";

    if (transfer) {
        direction = transfer.direction;
        from = transfer.from;
        to = transfer.to;
        value = transfer.value;
        valueLamports = transfer.lamports;
        asset = transfer.asset;
        type = transfer.type;
    } else if (balanceChange) {
        if (balanceChange.netChange > 0) {
            direction = "RECEIVED";
            valueLamports =
                balanceChange.netChange;
            value =
                formatSOL(valueLamports);
            to = walletAddress;
        } else if (balanceChange.netChange < 0) {
            direction = "SENT";

            /*
             * Include the fee in the effective outgoing
             * amount for program-only transactions.
             */
            valueLamports =
                Math.abs(balanceChange.netChange);

            value =
                formatSOL(valueLamports);

            from = walletAddress;
        }

        type = "program";
    }

    let method = "Unknown";

    if (programs.length) {
        method = programs.join(", ");
    }

    return {
        txid: signature,
        blockchain: "solana",

        direction,

        from,
        to,

        valueLamports,
        value,

        asset,

        timestamp,

        blockNumber: slot,

        feeLamports,
        fee: formatSOL(feeLamports),

        status: failed
            ? "FAILED"
            : "CONFIRMED",

        method,

        type,

        programs,

        error: failed
            ? signatureInfo.err
            : null,
    };
}

/**
 * Build a TraceX-style fund-flow graph.
 */
function buildFundFlow(
    transactions,
    walletAddress
) {
    const nodes = [
        {
            id: walletAddress,
            label: shortenAddress(walletAddress),
            type: "wallet",
        },
    ];

    const edges = [];

    const knownNodes = new Set([
        walletAddress,
    ]);

    for (const tx of transactions) {
        if (
            !tx.from ||
            !tx.to ||
            tx.direction === "UNKNOWN"
        ) {
            continue;
        }

        const counterparty =
            tx.direction === "SENT"
                ? tx.to
                : tx.from;

        if (
            counterparty &&
            counterparty !== walletAddress &&
            !knownNodes.has(counterparty)
        ) {
            nodes.push({
                id: counterparty,
                label: shortenAddress(counterparty),
                type: "address",
            });

            knownNodes.add(counterparty);
        }

        if (
            tx.from &&
            tx.to &&
            tx.from !== tx.to
        ) {
            edges.push({
                id: `${tx.txid}-${edges.length}`,
                source: tx.from,
                target: tx.to,
                label: `${tx.value} ${tx.asset}`,
                txid: tx.txid,
            });
        }
    }

    return {
        nodes,
        edges,
    };
}

/**
 * Generate a simple heuristic risk assessment.
 *
 * This is an investigative heuristic, not a definitive
 * determination of malicious activity.
 */
function generateRiskAnalysis(
    transactions,
    walletAddress
) {
    if (!transactions.length) {
        return {
            riskScore: 0,
            riskLevel: "NO ACTIVITY",
            riskFactors: [
                "No analyzed transactions found.",
            ],
        };
    }

    let score = 0;
    const riskFactors = [];

    const sent = transactions.filter(
        (tx) => tx.direction === "SENT"
    ).length;

    const received = transactions.filter(
        (tx) => tx.direction === "RECEIVED"
    ).length;

    const failed = transactions.filter(
        (tx) => tx.status === "FAILED"
    ).length;

    const programTransactions =
        transactions.filter(
            (tx) => tx.type === "program"
        ).length;

    const destinations = new Set(
        transactions
            .filter(
                (tx) =>
                    tx.direction === "SENT" &&
                    tx.to &&
                    tx.to !== walletAddress
            )
            .map((tx) => tx.to)
    );

    const outgoingRatio =
        transactions.length
            ? sent / transactions.length
            : 0;

    /*
     * Transaction frequency.
     */
    if (transactions.length >= 300) {
        score += 15;
        riskFactors.push(
            "High transaction activity in the analyzed history."
        );
    } else if (transactions.length >= 100) {
        score += 2;
    }

    /*
     * Outgoing activity.
     */
    if (outgoingRatio >= 0.8) {
        score += 15;
        riskFactors.push(
            "High proportion of outgoing transactions."
        );
    } else if (outgoingRatio >= 0.6) {
        score += 8;
    }

    /*
     * Destination diversity.
     */
    if (destinations.size >= 50) {
        score += 15;
        riskFactors.push(
            "Funds were sent to a large number of distinct addresses."
        );
    } else if (destinations.size >= 20) {
        score += 8;
    }

    /*
     * Program interaction.
     */
    if (
        transactions.length > 0 &&
        programTransactions /
            transactions.length >=
            0.8
    ) {
        score += 10;
        riskFactors.push(
            "High level of program interaction."
        );
    }

    /*
     * Failed transactions.
     */
    const failedRatio =
        failed / transactions.length;

    if (failedRatio >= 0.25) {
        score += 10;
        riskFactors.push(
            "Elevated proportion of failed transactions."
        );
    }

    /*
     * Very high sent/received imbalance.
     */
    if (
        sent >= 20 &&
        received <= 2
    ) {
        score += 10;
        riskFactors.push(
            "Strong outgoing transaction imbalance."
        );
    }

    score = Math.min(
        100,
        Math.round(score)
    );

    let riskLevel;

    if (score >= 70) {
        riskLevel = "HIGH RISK";
    } else if (score >= 40) {
        riskLevel = "LOW-MODERATE RISK";
    } else if (score >= 20) {
        riskLevel = "LOW RISK";
    } else {
        riskLevel = "MINIMAL RISK";
    }

    if (!riskFactors.length) {
        riskFactors.push(
            "No major heuristic risk indicators detected."
        );
    }

    return {
        riskScore: score,
        riskLevel,
        riskFactors,

        metrics: {
            analyzedTransactions:
                transactions.length,

            sentTransactions: sent,

            receivedTransactions:
                received,

            failedTransactions: failed,

            programTransactions,

            uniqueDestinations:
                destinations.size,

            outgoingRatio,
        },
    };
}

/**
 * Main Solana analysis entry point.
 */
async function getSolanaAnalysisData(
    wallet,
    blockchainKey = "solana"
) {
    if (!wallet || !wallet.trim()) {
        throw new Error(
            "Solana wallet address is required."
        );
    }

    let publicKey;

    try {
        publicKey =
            new PublicKey(wallet.trim());
    } catch {
        throw new Error(
            "Invalid Solana wallet address."
        );
    }

    const walletAddress =
        publicKey.toBase58();

    const connection =
        getConnection();

    console.log(
        "Fetching REAL Solana data..."
    );

    console.log(
        "Wallet:",
        walletAddress
    );

    /*
     * Fetch balance and transaction signatures.
     */
    const [balanceLamports, signatures] =
        await Promise.all([
            connection.getBalance(
                publicKey
            ),
            getSignatures(
                connection,
                publicKey
            ),
        ]);

    /*
     * Fetch transaction details.
     *
     * A small concurrency limit helps avoid hammering
     * public RPC providers.
     */
    const transactions = [];

    const concurrency = 8;

    for (
        let i = 0;
        i < signatures.length;
        i += concurrency
    ) {
        const batch =
            signatures.slice(
                i,
                i + concurrency
            );

        const results =
            await Promise.all(
                batch.map(
                    async (signatureInfo) => {
                        try {
                            const transaction =
                                await connection.getParsedTransaction(
                                    signatureInfo.signature,
                                    {
                                        maxSupportedTransactionVersion: 0,
                                        commitment:
                                            "confirmed",
                                    }
                                );

                            if (!transaction) {
                                return null;
                            }

                            return normalizeTransaction(
                                signatureInfo,
                                transaction,
                                walletAddress
                            );
                        } catch (error) {
                            console.error(
                                `Failed to fetch Solana transaction ${signatureInfo.signature}:`,
                                error.message
                            );

                            return null;
                        }
                    }
                )
            );

        transactions.push(
            ...results.filter(Boolean)
        );
    }

    /*
     * Newest first.
     */
    transactions.sort(
        (a, b) =>
            (b.timestamp || 0) -
            (a.timestamp || 0)
    );

    const sentTransactions =
        transactions.filter(
            (tx) =>
                tx.direction === "SENT"
        );

    const receivedTransactions =
        transactions.filter(
            (tx) =>
                tx.direction === "RECEIVED"
        );

    const failedTransactions =
        transactions.filter(
            (tx) =>
                tx.status === "FAILED"
        );

    const nativeTransactions =
        transactions.filter(
            (tx) =>
                tx.asset === "SOL"
        );

    const programTransactions =
        transactions.filter(
            (tx) =>
                tx.type === "program"
        );

    const totalSentLamports =
        sentTransactions.reduce(
            (sum, tx) =>
                sum +
                Number(
                    tx.valueLamports || 0
                ),
            0
        );

    const totalReceivedLamports =
        receivedTransactions.reduce(
            (sum, tx) =>
                sum +
                Number(
                    tx.valueLamports || 0
                ),
            0
        );

    const totalFeesLamports =
        transactions.reduce(
            (sum, tx) =>
                sum +
                Number(
                    tx.feeLamports || 0
                ),
            0
        );

    const fundFlow =
        buildFundFlow(
            transactions,
            walletAddress
        );

    const risk =
        generateRiskAnalysis(
            transactions,
            walletAddress
        );

    console.log(
        "Solana transactions:",
        transactions.length
    );

    console.log(
        "Sent:",
        sentTransactions.length
    );

    console.log(
        "Received:",
        receivedTransactions.length
    );

    console.log(
        "Failed:",
        failedTransactions.length
    );

    return {
        wallet: walletAddress,

        blockchain: blockchainKey,

        balance: formatSOL(
            balanceLamports
        ),

        balanceSOL: formatSOL(
            balanceLamports
        ),

        balanceLamports,

        transactionCount:
            transactions.length,

        transactions,

        nativeTransactions,

        tokenTransactions: [],

        programTransactions,

        sentTransactions:
            sentTransactions.length,

        receivedTransactions:
            receivedTransactions.length,

        failedTransactions:
            failedTransactions.length,

        totalSent:
            formatSOL(
                totalSentLamports
            ),

        totalReceived:
            formatSOL(
                totalReceivedLamports
            ),

        totalFees:
            formatSOL(
                totalFeesLamports
            ),

        totalSentLamports,

        totalReceivedLamports,

        totalFeesLamports,

        riskScore:
            risk.riskScore,

        riskLevel:
            risk.riskLevel,

        riskFactors:
            risk.riskFactors,

        riskMetrics:
            risk.metrics,

        fundFlow,

        metadata: {
            rpc: SOLANA_RPC_URL,
            historyLimit:
                MAX_TRANSACTIONS,
            fetchedTransactions:
                transactions.length,
            historyMayBePartial:
                signatures.length >=
                MAX_TRANSACTIONS,
        },
    };
}

module.exports = {
    getSolanaAnalysisData,
};