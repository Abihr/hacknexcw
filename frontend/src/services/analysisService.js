import { analyzeWalletAPI } from "./api.js";

export async function analyzeWallet({
    wallet,
    blockchain,
    transaction,
}) {
    const response = await analyzeWalletAPI({
        wallet,
        blockchain,
        transaction,
    });

    if (!response || response.success === false) {
        throw new Error(
            response?.message || "Wallet analysis failed."
        );
    }

    return response.data;
}