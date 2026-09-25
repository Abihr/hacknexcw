export const ANALYZE_WALLET_ENDPOINT = "/api/analyze";

/*
 * Request sent from TraceX frontend → backend
 */
export const analyzeWalletRequest = {
    wallet: "string",
    blockchain: "string",
    transaction: "string",
};

/*
 * Response expected from backend → TraceX frontend
 *
 * Your backend team should follow this structure.
 */
export const analyzeWalletResponse = {
    success: true,

    data: {
        wallet: "string",
        blockchain: "string",
        transaction: "string",

        riskScore: "number",
        riskLevel: "string",
        status: "string",

        transactions: "number",
        volume: "string",
        hops: "number",

        entity: "string",

        indicators: [
            {
                title: "string",
                severity: "string",
                description: "string",
            },
        ],

        /*
         * Individual transaction information.
         */
        transactionDetails: [
            {
                hash: "string",
                from: "string",
                to: "string",
                amount: "number",
                timestamp: "string",
                status: "string",
            },
        ],

        /*
         * Nodes and connections for the
         * fund-flow visualization.
         */
        fundFlow: {
            nodes: [
                {
                    id: "string",
                    type: "string",
                    label: "string",
                    address: "string",
                    entity: "string",
                    status: "string",
                },
            ],

            edges: [
                {
                    from: "string",
                    to: "string",
                    amount: "number",
                    asset: "string",
                    timestamp: "string",
                },
            ],
        },

        /*
         * Detected entities such as:
         * exchange, mixer, bridge, DEX, etc.
         */
        entities: [
            {
                name: "string",
                type: "string",
                confidence: "number",
                address: "string",
            },
        ],

        /*
         * Explanation of how the risk score
         * was calculated.
         */
        riskBreakdown: [
            {
                factor: "string",
                points: "number",
                description: "string",
            },
        ],
    },
};