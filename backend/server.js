const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());


// ============================================================
// BITCOIN ADDRESS INFORMATION
// ============================================================

async function getBitcoinAddressInfo(address) {
  const url = `https://blockstream.info/api/address/${address}`;

  console.log(`Fetching Bitcoin address info: ${address}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Blockstream address API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}


// ============================================================
// BITCOIN TRANSACTION HISTORY
// ============================================================

async function getBitcoinTransactions(address) {
  const maxTransactions = 500;
  const batchSize = 25;

  let transactions = [];
  let lastSeenTxid = null;

  while (transactions.length < maxTransactions) {
    let url;

    if (!lastSeenTxid) {
      url = `https://blockstream.info/api/address/${address}/txs`;
    } else {
      url = `https://blockstream.info/api/address/${address}/txs/chain/${lastSeenTxid}`;
    }

    let batch = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 30000);

      try {
        console.log(
          `Fetching transaction batch ${Math.floor(
            transactions.length / batchSize
          ) + 1}, attempt ${attempt}...`
        );

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(
            `Blockstream transaction API error: ${response.status} ${response.statusText}`
          );
        }

        batch = await response.json();
        break;
      } catch (error) {
        clearTimeout(timeout);

        console.error(
          `Transaction request failed (attempt ${attempt}):`,
          error.message
        );

        if (attempt === 3) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!batch || batch.length === 0) {
      break;
    }

    transactions.push(...batch);

    console.log(
      `Fetched ${batch.length} transactions. Total: ${transactions.length}`
    );

    if (batch.length < batchSize) {
      break;
    }

    lastSeenTxid = batch[batch.length - 1].txid;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return transactions.slice(0, maxTransactions);
}


// ============================================================
// PARSE BITCOIN TRANSACTIONS
// ============================================================

function parseBitcoinTransactions(transactions, walletAddress) {
  return transactions.map((tx) => {
    const inputs = tx.vin || [];
    const outputs = tx.vout || [];

    const inputAddresses = [];
    const outputAddresses = [];

    let inputValue = 0;
    let outputValue = 0;

    let walletReceived = 0;
    let walletSpent = 0;

    const externalOutputs = [];

    // --------------------------------------------------------
    // INPUTS
    // --------------------------------------------------------

    for (const input of inputs) {
      const prevout = input.prevout;

      if (!prevout) {
        continue;
      }

      const value = prevout.value || 0;
      const address = prevout.scriptpubkey_address;

      inputValue += value;

      if (address) {
        inputAddresses.push(address);
      }

      if (address === walletAddress) {
        walletSpent += value;
      }
    }

    // --------------------------------------------------------
    // OUTPUTS
    // --------------------------------------------------------

    for (const output of outputs) {
      const value = output.value || 0;
      const address = output.scriptpubkey_address;

      outputValue += value;

      if (address) {
        outputAddresses.push(address);
      }

      if (address === walletAddress) {
        walletReceived += value;
      } else if (address) {
        externalOutputs.push({
          address,
          value,
        });
      }
    }

    // --------------------------------------------------------
    // EXTERNAL OUTPUT VALUE
    // --------------------------------------------------------

    const externalOutputValue = externalOutputs.reduce(
      (sum, output) => sum + output.value,
      0
    );

    // --------------------------------------------------------
    // FEE
    // --------------------------------------------------------

    const fee = Math.max(inputValue - outputValue, 0);

    // --------------------------------------------------------
    // INPUT SOURCES
    // --------------------------------------------------------

    const inputSources = inputs
      .filter((input) => input.prevout)
      .map((input) => ({
        address: input.prevout.scriptpubkey_address || null,
        value: input.prevout.value || 0,
      }))
      .filter((source) => source.address);

    // --------------------------------------------------------
    // TRANSACTION DIRECTION
    // --------------------------------------------------------

    let direction = "UNKNOWN";

    if (walletSpent > 0 && externalOutputValue > 0) {
      direction = "SENT";
    } else if (walletReceived > 0 && walletSpent === 0) {
      direction = "RECEIVED";
    } else if (
      walletSpent > 0 &&
      walletReceived > 0 &&
      externalOutputValue === 0
    ) {
      direction = "SELF_TRANSFER";
    } else if (walletSpent > 0) {
      direction = "SENT";
    } else if (walletReceived > 0) {
      direction = "RECEIVED";
    }

    // --------------------------------------------------------
    // TIMESTAMP
    // --------------------------------------------------------

    let timestamp = null;

    if (tx.status?.block_time) {
      timestamp = new Date(tx.status.block_time * 1000).toISOString();
    }

    // --------------------------------------------------------
    // RETURN PARSED TRANSACTION
    // --------------------------------------------------------

    return {
      txid: tx.txid,

      status: tx.status?.confirmed ? "CONFIRMED" : "UNCONFIRMED",

      blockHeight: tx.status?.block_height || null,

      timestamp,

      direction,

      walletReceived,

      walletSpent,

      externalOutputValue,

      externalOutputs,

      fee,

      totalInputValue: inputValue,

      totalOutputValue: outputValue,

      inputAddresses,

      outputAddresses,

      inputSources,

      inputCount: inputs.length,

      outputCount: outputs.length,
    };
  });
}


// ============================================================
// BUILD FUND FLOW
// ============================================================

function buildFundFlow(transactions, walletAddress) {
  const nodes = [];
  const edges = [];

  const nodeIds = new Set();

  function addNode(id, label) {
    if (nodeIds.has(id)) {
      return;
    }

    nodeIds.add(id);

    nodes.push({
      id,
      type: "default",
      data: {
        label,
        address: id,
      },
      position: {
        x: 0,
        y: nodes.length * 100,
      },
    });
  }

  for (const tx of transactions) {
    // --------------------------------------------------------
    // RECEIVED
    // --------------------------------------------------------

    if (tx.direction === "RECEIVED") {
      addNode(walletAddress, walletAddress);

      for (const source of tx.inputSources || []) {
        if (!source.address) {
          continue;
        }

        addNode(source.address, source.address);

        edges.push({
          id: `${tx.txid}-${source.address}-${walletAddress}`,
          source: source.address,
          target: walletAddress,

          label: `${(source.value / 100000000).toFixed(8)} BTC`,

          data: {
            amountBTC: source.value / 100000000,
            txid: tx.txid,
            timestamp: tx.timestamp,
          },
        });
      }
    }

    // --------------------------------------------------------
    // SENT
    // --------------------------------------------------------

    if (tx.direction === "SENT") {
      addNode(walletAddress, walletAddress);

      for (const output of tx.externalOutputs || []) {
        if (!output.address) {
          continue;
        }

        addNode(output.address, output.address);

        edges.push({
          id: `${tx.txid}-${walletAddress}-${output.address}`,
          source: walletAddress,
          target: output.address,

          label: `${(output.value / 100000000).toFixed(8)} BTC`,

          data: {
            amountBTC: output.value / 100000000,
            txid: tx.txid,
            timestamp: tx.timestamp,
          },
        });
      }
    }
  }

  addNode(walletAddress, walletAddress);

  return {
    nodes,
    edges,
  };
}


// ============================================================
// BEHAVIORAL RISK ANALYSIS
// ============================================================

function generateRiskAnalysis(
  wallet,
  blockchain,
  transaction,
  bitcoinTransactions,
  lifetimeTransactionCount
) {
  const analyzedTransactions = bitcoinTransactions.length;

  // ----------------------------------------------------------
  // NO TRANSACTIONS
  // ----------------------------------------------------------

  if (analyzedTransactions === 0) {
    return {
      riskScore: 0,

      riskLevel: "LOW RISK",

      status: "No transaction history available for analysis.",

      volume: "0 BTC",

      hops: 0,

      entity: "Unknown",

      indicators: [
        "No transaction activity found.",
      ],

      transactionDetails: [],

      entities: [],

      riskBreakdown: [],

      analysisScope: {
        analyzedTransactions: 0,
        lifetimeTransactions: lifetimeTransactionCount,
        isPartialHistory: lifetimeTransactionCount > 0,
      },
    };
  }


  // ==========================================================
  // BASIC STATISTICS
  // ==========================================================

  const sentTransactions = bitcoinTransactions.filter(
    (tx) => tx.direction === "SENT"
  );

  const receivedTransactions = bitcoinTransactions.filter(
    (tx) => tx.direction === "RECEIVED"
  );

  const selfTransfers = bitcoinTransactions.filter(
    (tx) => tx.direction === "SELF_TRANSFER"
  );


  // ----------------------------------------------------------
  // TOTAL SENT
  // ----------------------------------------------------------

  const totalSentBTC = bitcoinTransactions.reduce(
    (sum, tx) =>
      sum + (tx.externalOutputValue || 0) / 100000000,
    0
  );


  // ----------------------------------------------------------
  // TOTAL RECEIVED
  // ----------------------------------------------------------

  const totalReceivedBTC = bitcoinTransactions.reduce(
    (sum, tx) =>
      sum + (tx.walletReceived || 0) / 100000000,
    0
  );


  // ----------------------------------------------------------
  // AVERAGE SENT
  // ----------------------------------------------------------

  const averageSentBTC =
    sentTransactions.length > 0
      ? totalSentBTC / sentTransactions.length
      : 0;


  // ----------------------------------------------------------
  // AVERAGE RECEIVED
  // ----------------------------------------------------------

  const averageReceivedBTC =
    receivedTransactions.length > 0
      ? totalReceivedBTC / receivedTransactions.length
      : 0;


  // ==========================================================
  // RISK SCORE
  // ==========================================================

  let riskScore = 0;

  const indicators = [];

  const riskBreakdown = [];


  // ==========================================================
  // 1. TRANSACTION FREQUENCY
  // ==========================================================

  const transactionFrequency = analyzedTransactions;

  let frequencyScore = 0;

  if (transactionFrequency >= 400) {
    frequencyScore = 20;

    indicators.push(
      "Very high transaction activity"
    );
  } else if (transactionFrequency >= 200) {
    frequencyScore = 15;

    indicators.push(
      "High transaction activity"
    );
  } else if (transactionFrequency >= 100) {
    frequencyScore = 10;

    indicators.push(
      "Moderate transaction activity"
    );
  } else if (transactionFrequency >= 50) {
    frequencyScore = 5;
  }

  riskScore += frequencyScore;

  riskBreakdown.push({
    factor: "Transaction Frequency",

    score: frequencyScore,

    description:
      `${analyzedTransactions} transactions analyzed`,
  });


  // ==========================================================
  // 2. OUTGOING TRANSACTION RATIO
  // ==========================================================

  const outgoingRatio =
    analyzedTransactions > 0
      ? sentTransactions.length / analyzedTransactions
      : 0;

  let outgoingScore = 0;

  if (outgoingRatio >= 0.8) {
    outgoingScore = 15;

    indicators.push(
      "Very high proportion of outgoing transactions"
    );
  } else if (outgoingRatio >= 0.6) {
    outgoingScore = 10;

    indicators.push(
      "High proportion of outgoing transactions"
    );
  } else if (outgoingRatio >= 0.4) {
    outgoingScore = 5;
  }

  riskScore += outgoingScore;

  riskBreakdown.push({
    factor: "Outgoing Activity",

    score: outgoingScore,

    description:
      `${(outgoingRatio * 100).toFixed(1)}% of analyzed transactions are outgoing`,
  });


  // ==========================================================
  // 3. TRANSACTION SIZE
  // ==========================================================

  let sizeScore = 0;

  if (averageSentBTC >= 100) {
    sizeScore = 20;

    indicators.push(
      "Extremely large average outgoing transaction"
    );
  } else if (averageSentBTC >= 10) {
    sizeScore = 15;

    indicators.push(
      "Large average outgoing transaction"
    );
  } else if (averageSentBTC >= 1) {
    sizeScore = 8;
  }

  riskScore += sizeScore;

  riskBreakdown.push({
    factor: "Transaction Size",

    score: sizeScore,

    description:
      `Average outgoing transaction: ${averageSentBTC.toFixed(4)} BTC`,
  });


  // ==========================================================
  // 4. FAN-OUT / DESTINATION DIVERSITY
  // ==========================================================

  const destinationAddresses = new Set();

  bitcoinTransactions.forEach((tx) => {
    if (tx.direction !== "SENT") {
      return;
    }

    (tx.externalOutputs || []).forEach((output) => {
      if (output.address) {
        destinationAddresses.add(output.address);
      }
    });
  });

  const uniqueDestinations =
    destinationAddresses.size;

  let fanOutScore = 0;

  if (uniqueDestinations >= 200) {
    fanOutScore = 15;

    indicators.push(
      "Very high number of unique outgoing destinations"
    );
  } else if (uniqueDestinations >= 100) {
    fanOutScore = 10;

    indicators.push(
      "High number of unique outgoing destinations"
    );
  } else if (uniqueDestinations >= 50) {
    fanOutScore = 5;
  }

  riskScore += fanOutScore;

  riskBreakdown.push({
    factor: "Destination Diversity",

    score: fanOutScore,

    description:
      `${uniqueDestinations} unique outgoing addresses`,
  });


  // ==========================================================
  // 5. FAN-IN / SOURCE DIVERSITY
  // ==========================================================

  const sourceAddresses = new Set();

  bitcoinTransactions.forEach((tx) => {
    if (tx.direction !== "RECEIVED") {
      return;
    }

    (tx.inputSources || []).forEach((source) => {
      if (source.address) {
        sourceAddresses.add(source.address);
      }
    });
  });

  const uniqueSources =
    sourceAddresses.size;

  let fanInScore = 0;

  if (uniqueSources >= 200) {
    fanInScore = 10;

    indicators.push(
      "Very high number of unique incoming sources"
    );
  } else if (uniqueSources >= 100) {
    fanInScore = 7;

    indicators.push(
      "High number of unique incoming sources"
    );
  } else if (uniqueSources >= 50) {
    fanInScore = 3;
  }

  riskScore += fanInScore;

  riskBreakdown.push({
    factor: "Source Diversity",

    score: fanInScore,

    description:
      `${uniqueSources} unique incoming addresses`,
  });


  // ==========================================================
  // 6. SELF TRANSFERS
  // ==========================================================

  const selfTransferRatio =
    analyzedTransactions > 0
      ? selfTransfers.length / analyzedTransactions
      : 0;

  let selfTransferScore = 0;

  if (selfTransferRatio >= 0.5) {
    selfTransferScore = 10;

    indicators.push(
      "Frequent self-transfer behavior"
    );
  } else if (selfTransferRatio >= 0.25) {
    selfTransferScore = 5;
  }

  riskScore += selfTransferScore;

  riskBreakdown.push({
    factor: "Self Transfers",

    score: selfTransferScore,

    description:
      `${selfTransfers.length} self-transfer transactions`,
  });


  // ==========================================================
  // LIMIT SCORE
  // ==========================================================

  riskScore = Math.min(
    Math.round(riskScore),
    100
  );


  // ==========================================================
  // RISK LEVEL
  // ==========================================================

  let riskLevel;

  if (riskScore >= 75) {
    riskLevel = "HIGH RISK";
  } else if (riskScore >= 50) {
    riskLevel = "MEDIUM RISK";
  } else if (riskScore >= 25) {
    riskLevel = "LOW-MODERATE RISK";
  } else {
    riskLevel = "LOW RISK";
  }


  // ==========================================================
  // STATUS
  // ==========================================================

  const status =
    lifetimeTransactionCount > analyzedTransactions
      ? `Behavioral analysis completed using ${analyzedTransactions} of ${lifetimeTransactionCount} lifetime transactions.`
      : `Behavioral analysis completed using all ${analyzedTransactions} available transactions.`;


  // ==========================================================
  // FINAL RESULT
  // ==========================================================

  return {
    riskScore,

    riskLevel,

    status,

    volume:
      `${(totalSentBTC + totalReceivedBTC).toFixed(8)} BTC`,

    hops: 0,

    entity: "Unknown",

    indicators,

    transactionDetails:
      bitcoinTransactions.slice(0, 20),

    entities: [],

    riskBreakdown,

    analysisScope: {
      analyzedTransactions,

      lifetimeTransactions:
        lifetimeTransactionCount,

      isPartialHistory:
        lifetimeTransactionCount > analyzedTransactions,
    },
  };
}


// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TraceX backend is running",
    port: PORT,
  });
});


// ============================================================
// ANALYZE WALLET
// ============================================================

app.post("/api/analyze", async (req, res) => {
  console.log("------------------------------------------");
  console.log("New analysis request");

  try {
    const {
      wallet,
      blockchain,
      transaction,
    } = req.body;


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!wallet) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    if (!blockchain) {
      return res.status(400).json({
        success: false,
        error: "Blockchain is required",
      });
    }


    console.log(`Wallet: ${wallet}`);
    console.log(`Blockchain: ${blockchain}`);
    console.log(
      `Transaction: ${transaction || "Not provided"}`
    );


    // --------------------------------------------------------
    // BLOCKCHAIN CHECK
    // --------------------------------------------------------

    if (
      blockchain.toLowerCase() !== "bitcoin"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Currently only Bitcoin analysis is supported.",
      });
    }


    // --------------------------------------------------------
    // FETCH ADDRESS INFORMATION
    // --------------------------------------------------------

    console.log("------------------------------------------");
    console.log("Fetching REAL Bitcoin data...");

    const addressInfo =
      await getBitcoinAddressInfo(wallet);


    // --------------------------------------------------------
    // FETCH TRANSACTION HISTORY
    // --------------------------------------------------------

    const bitcoinTransactions =
      await getBitcoinTransactions(wallet);


    console.log(
      `Fetched ${bitcoinTransactions.length} transactions`
    );


    // --------------------------------------------------------
    // PARSE TRANSACTIONS
    // --------------------------------------------------------

    const parsedTransactions =
      parseBitcoinTransactions(
        bitcoinTransactions,
        wallet
      );


    // --------------------------------------------------------
    // LIFETIME TRANSACTION COUNT
    // --------------------------------------------------------

    const confirmedTransactionCount =
      addressInfo.chain_stats?.tx_count || 0;

    const mempoolTransactionCount =
      addressInfo.mempool_stats?.tx_count || 0;

    const lifetimeTransactionCount =
      confirmedTransactionCount +
      mempoolTransactionCount;


    // --------------------------------------------------------
    // TRANSACTION COUNTS
    // --------------------------------------------------------

    const sentTransactionCount =
      parsedTransactions.filter(
        (tx) => tx.direction === "SENT"
      ).length;

    const receivedTransactionCount =
      parsedTransactions.filter(
        (tx) => tx.direction === "RECEIVED"
      ).length;


    // --------------------------------------------------------
    // TOTAL RECEIVED
    // --------------------------------------------------------

    const totalReceivedSats =
      parsedTransactions.reduce(
        (sum, tx) =>
          sum + (tx.walletReceived || 0),
        0
      );


    // --------------------------------------------------------
    // TOTAL SENT
    // --------------------------------------------------------

    const totalSentSats =
      parsedTransactions.reduce(
        (sum, tx) =>
          sum + (tx.externalOutputValue || 0),
        0
      );


    // --------------------------------------------------------
    // TOTAL FEES
    // --------------------------------------------------------

    const totalFeesSats =
      parsedTransactions.reduce(
        (sum, tx) =>
          sum + (tx.fee || 0),
        0
      );


    // --------------------------------------------------------
    // CONVERT TO BTC
    // --------------------------------------------------------

    const totalReceivedBTC =
      totalReceivedSats / 100000000;

    const totalSentBTC =
      totalSentSats / 100000000;

    const totalFeesBTC =
      totalFeesSats / 100000000;


    // --------------------------------------------------------
    // VOLUME
    // --------------------------------------------------------

    const volumeBTC =
      totalReceivedBTC +
      totalSentBTC;


    // --------------------------------------------------------
    // BALANCE
    // --------------------------------------------------------

    const balanceSats =
      addressInfo.chain_stats?.funded_txo_sum -
      addressInfo.chain_stats?.spent_txo_sum;

    const balanceBTC =
      balanceSats / 100000000;


    // --------------------------------------------------------
    // FUND FLOW
    // --------------------------------------------------------

    const fundFlow =
      buildFundFlow(
        parsedTransactions,
        wallet
      );


    // --------------------------------------------------------
    // RISK ANALYSIS
    // --------------------------------------------------------

    const riskAnalysis =
      generateRiskAnalysis(
        wallet,
        blockchain,
        transaction,
        parsedTransactions,
        lifetimeTransactionCount
      );


    // ========================================================
    // FINAL RESPONSE
    // ========================================================

    const responseData = {
      wallet,

      blockchain,

      transaction:
        transaction || "Not provided",

      // ------------------------------------------------------
      // BALANCE
      // ------------------------------------------------------

      balance: balanceSats,

      balanceBTC,

      // ------------------------------------------------------
      // TRANSACTION COUNTS
      // ------------------------------------------------------

      transactions:
        lifetimeTransactionCount,

      fetchedTransactions:
        parsedTransactions.length,

      sentTransactions:
        sentTransactionCount,

      receivedTransactions:
        receivedTransactionCount,

      // ------------------------------------------------------
      // TOTALS
      // ------------------------------------------------------

      totalReceived:
        totalReceivedBTC,

      totalSent:
        totalSentBTC,

      totalFees:
        totalFeesBTC,

      volumeBTC,

      totalReceivedSats,

      totalSentSats,

      totalFeesSats,

      // ------------------------------------------------------
      // BLOCKCHAIN STATS
      // ------------------------------------------------------

      addressStats:
        addressInfo.chain_stats,

      mempoolStats:
        addressInfo.mempool_stats,

      // ------------------------------------------------------
      // TRANSACTION DATA
      // ------------------------------------------------------

      transactionData:
        parsedTransactions,

      // ------------------------------------------------------
      // RISK ANALYSIS
      // ------------------------------------------------------

      riskScore:
        riskAnalysis.riskScore,

      riskLevel:
        riskAnalysis.riskLevel,

      status:
        riskAnalysis.status,

      volume:
        riskAnalysis.volume,

      hops:
        riskAnalysis.hops,

      entity:
        riskAnalysis.entity,

      indicators:
        riskAnalysis.indicators,

      transactionDetails:
        riskAnalysis.transactionDetails,

      fundFlow,

      entities:
        riskAnalysis.entities,

      riskBreakdown:
        riskAnalysis.riskBreakdown,

      // ------------------------------------------------------
      // ANALYSIS SCOPE
      // ------------------------------------------------------

      analysisScope:
        riskAnalysis.analysisScope,
    };


    // --------------------------------------------------------
    // LOG SUMMARY
    // --------------------------------------------------------

    console.log("------------------------------------------");
    console.log("Bitcoin analysis complete");

    console.log(
      `Bitcoin balance: ${balanceBTC} BTC`
    );

    console.log(
      `Total received: ${totalReceivedBTC} BTC`
    );

    console.log(
      `Total sent: ${totalSentBTC} BTC`
    );

    console.log(
      `Total fees: ${totalFeesBTC} BTC`
    );

    console.log(
      `Transactions fetched: ${parsedTransactions.length}`
    );

    console.log(
      `Lifetime transactions: ${lifetimeTransactionCount}`
    );

    console.log(
      `Risk score: ${riskAnalysis.riskScore}`
    );

    console.log(
      `Risk level: ${riskAnalysis.riskLevel}`
    );

    console.log("------------------------------------------");


    // --------------------------------------------------------
    // SEND RESPONSE
    // --------------------------------------------------------

    return res.json({
      success: true,
      data: responseData,
    });

  } catch (error) {

    console.error(
      "Analysis error:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        error.message ||
        "Failed to analyze wallet",
    });
  }
});


// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log("------------------------------------------");
  console.log(
    `TraceX backend running on port ${PORT}`
  );
  console.log(
    `http://localhost:${PORT}`
  );
  console.log("------------------------------------------");
});