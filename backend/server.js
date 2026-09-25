const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// HELPER: FETCH REAL BITCOIN ADDRESS DATA
// --------------------------------------------------

async function getBitcoinAddressData(address) {
  const response = await fetch(
    `https://blockstream.info/api/address/${address}`
  );

  if (!response.ok) {
    throw new Error(
      `Bitcoin API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

async function getBitcoinTransactions(address) {
  const url = `https://blockstream.info/api/address/${address}/txs`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(
        `Fetching Bitcoin transactions (attempt ${attempt}/3)...`
      );

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 30000);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(
          `Bitcoin transaction API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      console.log(
        `Successfully received ${data.length} transactions`
      );

      return data;
    } catch (error) {
      console.error(
        `Transaction request attempt ${attempt} failed:`,
        error.message
      );

      if (attempt === 3) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );
    }
  }
}
function parseBitcoinTransactions(transactions, walletAddress) {
  return transactions.map((tx) => {
    const inputs = tx.vin || [];
    const outputs = tx.vout || [];

    const inputAddresses = inputs
      .map((input) => input.prevout?.scriptpubkey_address)
      .filter(Boolean);

    const outputAddresses = outputs
      .map((output) => output.scriptpubkey_address)
      .filter(Boolean);

    const inputValue = inputs.reduce(
      (total, input) => total + (input.prevout?.value || 0),
      0
    );

    const outputValue = outputs.reduce(
      (total, output) => total + (output.value || 0),
      0
    );

    const walletReceived = outputs
      .filter(
        (output) =>
          output.scriptpubkey_address === walletAddress
      )
      .reduce(
        (total, output) => total + (output.value || 0),
        0
      );

    const walletSpent = inputs
      .filter(
        (input) =>
          input.prevout?.scriptpubkey_address === walletAddress
      )
      .reduce(
        (total, input) => total + (input.prevout?.value || 0),
        0
      );

    let direction = "UNKNOWN";

    if (walletReceived > 0 && walletSpent > 0) {
      direction = "MIXED";
    } else if (walletReceived > 0) {
      direction = "RECEIVED";
    } else if (walletSpent > 0) {
      direction = "SENT";
    }

    return {
      txid: tx.txid,

      status: tx.status?.confirmed
        ? "CONFIRMED"
        : "UNCONFIRMED",

      blockHeight:
        tx.status?.block_height || null,

      timestamp:
        tx.status?.block_time
          ? new Date(
              tx.status.block_time * 1000
            ).toISOString()
          : null,

      direction,

      walletReceived,
      walletSpent,

      totalInputValue: inputValue,
      totalOutputValue: outputValue,

      inputAddresses,
      outputAddresses,

      inputCount: inputs.length,
      outputCount: outputs.length,
    };
  });
}
// --------------------------------------------------
// HELPER: GENERATE A STABLE NUMBER FROM A STRING
// --------------------------------------------------

function generateSeed(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TraceX backend is running",
  });
});

// --------------------------------------------------
// ANALYZE WALLET
// --------------------------------------------------

app.post("/api/analyze", async (req, res) => {
  try {
    const { wallet, blockchain, transaction } = req.body;

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    if (!blockchain) {
      return res.status(400).json({
        success: false,
        message: "Blockchain is required",
      });
    }

    console.log("------------------------------------------");
    console.log("New analysis request");
    console.log("Wallet:", wallet);
    console.log("Blockchain:", blockchain);
    console.log("Transaction:", transaction || "Not provided");
    console.log("------------------------------------------");

    // ----------------------------------------------
    // BITCOIN
    // ----------------------------------------------

    let bitcoinData = null;
    let bitcoinTransactions = [];

    if (blockchain.toLowerCase() === "bitcoin") {
      try {
        console.log("Fetching REAL Bitcoin data...");

        bitcoinData = await getBitcoinAddressData(wallet);
        bitcoinTransactions = await getBitcoinTransactions(wallet);

        console.log("Bitcoin data received:");
        console.log(JSON.stringify(bitcoinData, null, 2));
        console.log("Bitcoin transactions received:");
            console.log(`Found ${bitcoinTransactions.length} transactions`);
           const parsedTransactions =
  parseBitcoinTransactions(
    bitcoinTransactions,
    wallet
  );

console.log("Parsed transactions:");

console.log(
  JSON.stringify(
    parsedTransactions,
    null,
    2
  )
);
        }catch (error) {
  console.error("BITCOIN API ERROR:");
  console.error(error);
  console.error("Name:", error.name);
  console.error("Message:", error.message);
  console.error("Cause:", error.cause);

  return res.status(400).json({
    success: false,
    message:
      "Unable to fetch Bitcoin blockchain data.",
    error: error.message,
  });
}
    }

    // ----------------------------------------------
    // CREATE A STABLE SEED
    // ----------------------------------------------

    const seed = generateSeed(
      `${wallet}-${blockchain}-${transaction || ""}`
    );

    // ----------------------------------------------
    // BASIC REAL BITCOIN DATA
    // ----------------------------------------------

    let transactionCount = 0;
    let volumeBTC = 0;

    if (bitcoinData) {
      transactionCount =
        (bitcoinData.chain_stats?.tx_count || 0) +
        (bitcoinData.mempool_stats?.tx_count || 0);

      const funded =
        bitcoinData.chain_stats?.funded_txo_sum || 0;

      const spent =
        bitcoinData.chain_stats?.spent_txo_sum || 0;

      // Bitcoin API values are in satoshis.
      // Convert satoshis -> BTC.
      volumeBTC = Math.max(funded, spent) / 100000000;
    }

    // ----------------------------------------------
    // TEMPORARY RISK SCORE
    //
    // This is still a placeholder.
    // Later we will replace this with actual
    // transaction/risk analysis.
    // ----------------------------------------------

    const riskScore =
      40 +
      (seed % 40);

    let riskLevel;

    if (riskScore >= 75) {
      riskLevel = "HIGH RISK";
    } else if (riskScore >= 50) {
      riskLevel = "MEDIUM RISK";
    } else {
      riskLevel = "LOW RISK";
    }

    // ----------------------------------------------
    // STATUS
    // ----------------------------------------------

    let status;

    if (riskScore >= 75) {
      status = "High-risk activity detected";
    } else if (riskScore >= 50) {
      status = "Potentially suspicious activity";
    } else {
      status = "No major risk indicators detected";
    }

    // ----------------------------------------------
    // TEMPORARY INDICATORS
    // ----------------------------------------------

    const indicators = [
      {
        type: "Transaction Activity",
        severity:
          transactionCount > 100 ? "HIGH" : "MEDIUM",
        description:
          transactionCount > 100
            ? "Address has a high number of recorded transactions."
            : "Address has a moderate transaction history.",
      },

      {
        type: "Address Activity",
        severity: "LOW",
        description:
          "Address activity has been detected on the blockchain.",
      },

      {
        type: "Entity Identification",
        severity: "UNKNOWN",
        description:
          "No known entity has been identified for this address.",
      },
    ];

    // ----------------------------------------------
    // TEMPORARY TRANSACTION DETAILS
    // ----------------------------------------------

    const transactionDetails = [
      {
        hash:
          transaction ||
          "Transaction data will be added in the next stage",
        amount:
          volumeBTC > 0
            ? `${volumeBTC.toFixed(8)} BTC`
            : "Not available",
        direction: "UNKNOWN",
        timestamp: new Date().toISOString(),
        status: "CONFIRMED",
      },
    ];

    // ----------------------------------------------
    // TEMPORARY FUND FLOW
    // ----------------------------------------------

    const fundFlow = {
      nodes: [
        {
          id: "source",
          type: "default",
          data: {
            label: "Source",
          },
          position: {
            x: 0,
            y: 100,
          },
        },

        {
          id: "wallet",
          type: "default",
          data: {
            label: wallet,
          },
          position: {
            x: 300,
            y: 100,
          },
        },

        {
          id: "destination",
          type: "default",
          data: {
            label: "Destination",
          },
          position: {
            x: 600,
            y: 100,
          },
        },
      ],

      edges: [
        {
          id: "source-wallet",
          source: "source",
          target: "wallet",
          animated: true,
        },

        {
          id: "wallet-destination",
          source: "wallet",
          target: "destination",
          animated: true,
        },
      ],
    };

    // ----------------------------------------------
    // ENTITIES
    // ----------------------------------------------

    const entities = [
      {
        name: "Unknown Blockchain Entity",
        type: "Unknown",
        confidence: 0,
      },
    ];

    // ----------------------------------------------
    // RISK BREAKDOWN
    // ----------------------------------------------

    const riskBreakdown = [
      {
        category: "Transaction Activity",
        score: Math.min(
          100,
          30 + (transactionCount % 50)
        ),
      },

      {
        category: "Fund Flow",
        score: 50 + (seed % 30),
      },

      {
        category: "Entity Risk",
        score: 40 + (seed % 40),
      },

      {
        category: "Address Behavior",
        score: 30 + (seed % 50),
      },
    ];

    // ----------------------------------------------
    // FINAL RESPONSE
    // ----------------------------------------------

    const analysisData = {
      wallet,
      blockchain,
      transaction:
        transaction || "Not provided",

      riskScore,
      riskLevel,
      status,

      // Real blockchain transaction count
      transactions: transactionCount,

      // Real calculated BTC volume
      volume:
        volumeBTC > 0
          ? `${volumeBTC.toFixed(8)} BTC`
          : "0 BTC",

      // Temporary value until transaction graph
      // analysis is implemented
      hops: 2,

      entity: "Unknown Blockchain Entity",

      indicators,

      transactionDetails,

      fundFlow,

      entities,

      riskBreakdown,
    };

    // ----------------------------------------------
    // SEND RESPONSE
    // ----------------------------------------------

    return res.json({
      success: true,
      data: analysisData,
    });
  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log("------------------------------------------");
  console.log(`TraceX backend running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log("------------------------------------------");
});

