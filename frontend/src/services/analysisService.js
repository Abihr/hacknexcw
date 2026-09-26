
import { analyzeWalletAPI } from "./api.js";

/**
 * Analyze a wallet using the TraceX backend.
 *
 * Supported blockchain values:
 * - bitcoin
 * - ethereum
 * - bnb
 * - polygon
 * - base-sepolia
 * - base
 * - solana
 */
export async function analyzeWallet({
    wallet,
    blockchain,
    transaction = "",
}) {
    if (!wallet || !wallet.trim()) {
        throw new Error("Wallet address is required.");
    }

    if (!blockchain) {
        throw new Error("Blockchain is required.");
    }

    const normalizedBlockchain =
        blockchain.toLowerCase().trim();

    const supportedBlockchains = [
        "bitcoin",
        "ethereum",
        "bnb",
        "polygon",
        "base-sepolia",
        "base",
        "solana",
    ];

    if (!supportedBlockchains.includes(normalizedBlockchain)) {
        throw new Error(
            `Unsupported blockchain: ${blockchain}`
        );
    }

    console.log(
        "=========================================="
    );

    console.log(
        "TraceX analysis service"
    );

    console.log(
        "=========================================="
    );

    console.log(
        "Wallet:",
        wallet
    );

    console.log(
        "Blockchain:",
        normalizedBlockchain
    );

    console.log(
        "Transaction:",
        transaction || "Not provided"
    );

    console.log(
        "=========================================="
    );

    const response = await analyzeWalletAPI({
        wallet: wallet.trim(),

        blockchain: normalizedBlockchain,

        transaction: transaction.trim(),
    });

    /*
     * The backend returns the analysis object directly.
     *
     * Keep compatibility with both:
     *
     * { success: true, data: {...} }
     *
     * and:
     *
     * { wallet: "...", riskScore: ... }
     */

    if (
        response &&
        response.success === false
    ) {
        throw new Error(
            response.error ||
                response.message ||
                "Wallet analysis failed."
        );
    }

    if (
        response &&
        response.data
    ) {
        return response.data;
    }

    return response;
}

