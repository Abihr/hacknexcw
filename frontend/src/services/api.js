
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const API_MODE = import.meta.env.VITE_API_MODE || "mock";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `Server error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

function generateMockAnalysis(payload) {
  const wallet = payload.wallet;
  const blockchain = payload.blockchain;

  const seed = [...`${wallet}${blockchain}`].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );

  const riskScore = 40 + (seed % 51);

  const riskLevel =
    riskScore >= 75
      ? "HIGH RISK"
      : riskScore >= 55
        ? "MEDIUM RISK"
        : "LOW RISK";

  const hops = 2 + (seed % 4);

  const transactionCount = 15 + (seed % 60);

  const volumeValue = (2 + (seed % 150) / 10).toFixed(2);

  const asset =
    blockchain.toLowerCase().includes("bitcoin")
      ? "BTC"
      : blockchain.toLowerCase().includes("polygon")
        ? "MATIC"
        : "ETH";

  const walletSuffix = String(seed).slice(-3);

  return {
    wallet,
    blockchain,
    transaction: payload.transaction || "Not provided",

    riskScore,
    riskLevel,

    status:
      riskLevel === "HIGH RISK"
        ? "Suspicious activity detected"
        : riskLevel === "MEDIUM RISK"
          ? "Potentially suspicious activity"
          : "No major risk indicators detected",

    transactions: transactionCount,
    volume: `${volumeValue} ${asset}`,
    hops,

    entity:
      riskLevel === "HIGH RISK"
        ? "Potential Crypto Exchange"
        : "Unknown Blockchain Entity",

    indicators: [
      {
        title: "Transaction Pattern",
        severity: riskLevel === "HIGH RISK" ? "high" : "medium",
        description:
          "The transaction pattern requires further investigation.",
      },
      {
        title: "Fund Movement",
        severity: "medium",
        description: `${hops}-hop fund movement was detected.`,
      },
      {
        title: "Entity Association",
        severity: riskLevel === "HIGH RISK" ? "high" : "medium",
        description:
          "Potential links to other blockchain entities were detected.",
      },
    ],

    transactionDetails: [
      {
        hash: `0xabc${walletSuffix}123`,
        from: wallet,
        to: `0x3B...${walletSuffix}1C`,
        amount: Number(
          (0.4 + (seed % 50) / 100).toFixed(2)
        ),
        timestamp: "2026-09-19T10:30:00Z",
        status:
          riskLevel === "HIGH RISK"
            ? "Suspicious"
            : "Review",
      },
      {
        hash: `0xdef${walletSuffix}456`,
        from: `0x3B...${walletSuffix}1C`,
        to: `0xA4...${walletSuffix}2D`,
        amount: Number(
          (0.3 + (seed % 40) / 100).toFixed(2)
        ),
        timestamp: "2026-09-19T10:42:00Z",
        status:
          riskLevel === "HIGH RISK"
            ? "Suspicious"
            : "Review",
      },
    ],

    fundFlow: {
      nodes: [
        {
          id: "origin",
          type: "ORIGIN",
          label: "Investigated Wallet",
          address: wallet,
          entity: "Reported Wallet",
          status: "Reported",
        },
        {
          id: "hop1",
          type: "HOP",
          label: "Wallet 1",
          address: `0x3B...${walletSuffix}1C`,
          entity: "Unknown Wallet",
          status: "Suspicious",
        },
        {
          id: "hop2",
          type: "HOP",
          label: "Wallet 2",
          address: `0xA4...${walletSuffix}2D`,
          entity: "Unknown Wallet",
          status: "Suspicious",
        },
        {
          id: "destination",
          type: "DESTINATION",
          label: "Potential Exchange",
          address: `0xEX...${walletSuffix}89`,
          entity: "Crypto Exchange",
          status:
            riskLevel === "HIGH RISK"
              ? "High Risk"
              : "Requires Review",
        },
      ],

      edges: [
        {
          from: "origin",
          to: "hop1",
          amount: Number(
            (0.6 + (seed % 30) / 100).toFixed(2)
          ),
          asset,
          timestamp: "2026-09-19T10:30:00Z",
        },
        {
          from: "hop1",
          to: "hop2",
          amount: Number(
            (0.5 + (seed % 25) / 100).toFixed(2)
          ),
          asset,
          timestamp: "2026-09-19T10:42:00Z",
        },
        {
          from: "hop2",
          to: "destination",
          amount: Number(
            (0.4 + (seed % 20) / 100).toFixed(2)
          ),
          asset,
          timestamp: "2026-09-19T11:03:00Z",
        },
      ],
    },

    entities: [
      {
        name: "Potential Crypto Exchange",
        type: "exchange",
        confidence:
          riskLevel === "HIGH RISK" ? 0.82 : 0.58,
        address: `0xEX...${walletSuffix}89`,
      },
    ],

    riskBreakdown: [
      {
        factor: "Transaction Behavior",
        points: Math.min(30, riskScore),
        description:
          "Transaction behavior was evaluated for unusual activity.",
      },
      {
        factor: "Fund Movement",
        points: Math.min(25, Math.max(0, riskScore - 5)),
        description:
          "The movement of funds across addresses was analyzed.",
      },
      {
        factor: "Entity Association",
        points: Math.min(20, Math.max(0, riskScore - 10)),
        description:
          "Potential associations with known entity types were evaluated.",
      },
      {
        factor: "Transfer Value",
        points: Math.min(25, Math.max(0, riskScore - 15)),
        description:
          "Transfer values were evaluated against configured risk indicators.",
      },
    ],
  };
}

export async function analyzeWalletAPI(payload) {
  // MOCK MODE
  if (API_MODE === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      success: true,
      data: generateMockAnalysis(payload),
    };
  }

  // REAL BACKEND MODE
  return request("/api/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

