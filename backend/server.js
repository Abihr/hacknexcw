const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());


// ============================================================
// BITCOIN API
// ============================================================

async function getBitcoinAddressInfo(address) {
  const url = `https://blockstream.info/api/address/${address}`;

  console.log("Fetching Bitcoin address information...");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Bitcoin address API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}


// ============================================================
// GET BITCOIN TRANSACTION HISTORY
// ============================================================

async function getBitcoinTransactions(address) {
  const allTransactions = [];

  let lastSeenTxid = null;

  // Safety limit so one request cannot fetch an unlimited
  // amount of historical data.
  const maxTransactions = 500;

  while (allTransactions.length < maxTransactions) {
    let url = `https://blockstream.info/api/address/${address}/txs`;

    if (lastSeenTxid) {
      url += `/chain/${lastSeenTxid}`;
    }

    let batch = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Fetching Bitcoin transactions (batch ${
            Math.floor(allTransactions.length / 25) + 1
          }, attempt ${attempt}/3)...`
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

        batch = await response.json();

        console.log(
          `Received ${batch.length} transactions in this batch`
        );

        break;
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

    if (!batch || batch.length === 0) {
      break;
    }

    allTransactions.push(...batch);

    console.log(
      `Total transactions collected: ${allTransactions.length}`
    );

    if (batch.length < 25) {
      break;
    }

    lastSeenTxid =
      batch[batch.length - 1].txid;
  }

  console.log(
    `Finished fetching transaction history. Total collected: ${allTransactions.length}`
  );

  return allTransactions.slice(
    0,
    maxTransactions
  );
}


// ============================================================
// PARSE BITCOIN TRANSACTIONS
// ============================================================

function parseBitcoinTransactions(
  transactions,
  walletAddress
) {
  return transactions.map((tx) => {
    const inputs = tx.vin || [];
    const outputs = tx.vout || [];


    // --------------------------------------------------------
    // INPUT ADDRESSES
    // --------------------------------------------------------

    const inputAddresses = inputs
      .map(
        (input) =>
          input.prevout?.scriptpubkey_address
      )
      .filter(Boolean);


    // --------------------------------------------------------
    // OUTPUT ADDRESSES
    // --------------------------------------------------------

    const outputAddresses = outputs
      .map(
        (output) =>
          output.scriptpubkey_address
      )
      .filter(Boolean);


    // --------------------------------------------------------
    // TOTAL INPUT VALUE
    // --------------------------------------------------------

    const inputValue = inputs.reduce(
      (total, input) =>
        total + (input.prevout?.value || 0),
      0
    );


    // --------------------------------------------------------
    // TOTAL OUTPUT VALUE
    // --------------------------------------------------------

    const outputValue = outputs.reduce(
      (total, output) =>
        total + (output.value || 0),
      0
    );


    // --------------------------------------------------------
    // VALUE RECEIVED BY OUR WALLET
    //
    // This includes change returned to the wallet.
    // --------------------------------------------------------

    const walletReceived = outputs
      .filter(
        (output) =>
          output.scriptpubkey_address ===
          walletAddress
      )
      .reduce(
        (total, output) =>
          total + (output.value || 0),
        0
      );


    // --------------------------------------------------------
    // VALUE SPENT FROM OUR WALLET INPUTS
    //
    // This is the gross amount consumed from the wallet.
    // It is NOT necessarily the amount actually sent.
    // --------------------------------------------------------

    const walletSpent = inputs
      .filter(
        (input) =>
          input.prevout?.scriptpubkey_address ===
          walletAddress
      )
      .reduce(
        (total, input) =>
          total + (input.prevout?.value || 0),
        0
      );


    // --------------------------------------------------------
    // EXTERNAL OUTPUTS
    //
    // These are outputs going to addresses other than
    // our wallet.
    //
    // This is what we actually want for fund-flow analysis.
    // --------------------------------------------------------

    const externalOutputs = outputs
      .filter(
        (output) =>
          output.scriptpubkey_address &&
          output.scriptpubkey_address !==
            walletAddress
      )
      .map((output) => ({
        address:
          output.scriptpubkey_address,
        value: output.value || 0,
      }));


    // --------------------------------------------------------
    // TOTAL EXTERNAL VALUE
    // --------------------------------------------------------

    const externalOutputValue =
      externalOutputs.reduce(
        (total, output) =>
          total + output.value,
        0
      );


    // --------------------------------------------------------
    // TRANSACTION FEE
    //
    // Bitcoin fee =
    // total inputs - total outputs
    // --------------------------------------------------------

    const fee = Math.max(
      inputValue - outputValue,
      0
    );


    // --------------------------------------------------------
    // INPUT SOURCES
    //
    // Useful later for building incoming fund-flow edges.
    // --------------------------------------------------------

    const inputSources = inputs
      .filter(
        (input) =>
          input.prevout?.scriptpubkey_address
      )
      .map((input) => ({
        address:
          input.prevout.scriptpubkey_address,
        value:
          input.prevout.value || 0,
      }));


    // --------------------------------------------------------
    // DETERMINE DIRECTION
    // --------------------------------------------------------

    let direction = "UNKNOWN";


    // Wallet spends money and an external address
    // receives money.
    if (
      walletSpent > 0 &&
      externalOutputValue > 0
    ) {
      direction = "SENT";
    }

    // Wallet receives money but doesn't spend anything.
    else if (
      walletReceived > 0 &&
      walletSpent === 0
    ) {
      direction = "RECEIVED";
    }

    // Wallet spends money but everything goes back
    // to the wallet.
    else if (
      walletSpent > 0 &&
      walletReceived > 0 &&
      externalOutputValue === 0
    ) {
      direction = "SELF_TRANSFER";
    }

    // Fallback for transactions where the wallet spent
    // funds but output address information is incomplete.
    else if (walletSpent > 0) {
      direction = "SENT";
    }

    // Fallback for received transactions.
    else if (walletReceived > 0) {
      direction = "RECEIVED";
    }


    // --------------------------------------------------------
    // RETURN PARSED TRANSACTION
    // --------------------------------------------------------

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

      // Wallet-level values
      walletReceived,
      walletSpent,

      // Actual external transfer values
      externalOutputValue,
      externalOutputs,

      // Transaction fee
      fee,

      // Complete transaction values
      totalInputValue: inputValue,
      totalOutputValue: outputValue,

      // Address information
      inputAddresses,
      outputAddresses,
      inputSources,

      // Counts
      inputCount: inputs.length,
      outputCount: outputs.length,
    };
  });
}


// ============================================================
// BUILD FUND FLOW
// ============================================================

function buildFundFlow(
  transactions,
  walletAddress
) {
  const nodes = [];
  const edges = [];

  const nodeIds = new Set();


  // ----------------------------------------------------------
  // ADD NODE
  // ----------------------------------------------------------

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
        x: nodes.length * 250,
        y: 100,
      },
    });
  }


  // ----------------------------------------------------------
  // PROCESS TRANSACTIONS
  // ----------------------------------------------------------

  transactions.forEach((tx) => {


    // ========================================================
    // RECEIVED TRANSACTION
    // ========================================================

    if (tx.direction === "RECEIVED") {

      tx.inputSources.forEach(
        (source) => {

          if (
            source.address ===
            walletAddress
          ) {
            return;
          }

          addNode(
            source.address,
            source.address
          );

          edges.push({
            id: `${source.address}-${walletAddress}-${tx.txid}`,

            source:
              source.address,

            target:
              walletAddress,

            label: `${(
              source.value /
              100000000
            ).toFixed(8)} BTC`,

            amount:
              source.value /
              100000000,

            asset: "BTC",

            txid: tx.txid,

            timestamp:
              tx.timestamp,
          });
        }
      );
    }


    // ========================================================
    // SENT TRANSACTION
    // ========================================================

    if (tx.direction === "SENT") {

      // IMPORTANT:
      //
      // We use each external output's actual value.
      //
      // We do NOT use walletSpent here.
      //
      // This prevents double-counting when a transaction
      // has multiple destination outputs.

      tx.externalOutputs.forEach(
        (output) => {

          addNode(
            output.address,
            output.address
          );

          edges.push({
            id: `${walletAddress}-${output.address}-${tx.txid}`,

            source:
              walletAddress,

            target:
              output.address,

            label: `${(
              output.value /
              100000000
            ).toFixed(8)} BTC`,

            amount:
              output.value /
              100000000,

            asset: "BTC",

            txid: tx.txid,

            timestamp:
              tx.timestamp,
          });
        }
      );
    }
  });


  // ----------------------------------------------------------
  // ADD INVESTIGATED WALLET
  // ----------------------------------------------------------

  addNode(
    walletAddress,
    walletAddress
  );


  // ----------------------------------------------------------
  // RETURN GRAPH
  // ----------------------------------------------------------

  return {
    nodes,
    edges,
  };
}


// ============================================================
// GENERATE TEMPORARY RISK DATA
// ============================================================
//
// NOTE:
// This is still placeholder logic.
// It is NOT a real fraud/risk model yet.
// We will replace this later.
// ============================================================

function generateSeed(
  wallet,
  blockchain
) {
  return [...`${wallet}${blockchain}`]
    .reduce(
      (sum, char) =>
        sum + char.charCodeAt(0),
      0
    );
}


function generateRiskAnalysis(
  wallet,
  blockchain,
  transaction,
  bitcoinTransactions
) {
  const seed = generateSeed(
    wallet,
    blockchain
  );

  const riskScore =
    40 + (seed % 40);

  const riskLevel =
    riskScore >= 75
      ? "HIGH RISK"
      : riskScore >= 55
        ? "MEDIUM RISK"
        : "LOW RISK";


  const transactionCount =
    bitcoinTransactions.length;


  const totalSentSats =
    bitcoinTransactions.reduce(
      (total, tx) =>
        total +
        (tx.externalOutputValue || 0),
      0
    );


  const volumeBTC =
    (
      totalSentSats /
      100000000
    ).toFixed(8);


  return {
    riskScore,
    riskLevel,

    status:
      riskLevel === "HIGH RISK"
        ? "Suspicious activity detected"
        : riskLevel === "MEDIUM RISK"
          ? "Potentially suspicious activity"
          : "No major risk indicators detected",

    transactions:
      transactionCount,

    volume:
      `${volumeBTC} BTC`,

    hops: 0,

    entity:
      "Unknown Blockchain Entity",

    indicators: [
      {
        title:
          "Transaction Pattern",

        severity:
          riskLevel === "HIGH RISK"
            ? "high"
            : "medium",

        description:
          "Transaction behavior requires further investigation.",
      },

      {
        title:
          "Fund Movement",

        severity:
          "medium",

        description:
          "Bitcoin fund movement was analyzed from the wallet's transaction history.",
      },

      {
        title:
          "Entity Association",

        severity:
          "medium",

        description:
          "No verified blockchain entity identification is currently available.",
      },
    ],

    transactionDetails:
      bitcoinTransactions
        .slice(0, 20)
        .map((tx) => ({
          hash:
            tx.txid,

          from:
            tx.direction === "RECEIVED"
              ? (
                  tx.inputAddresses[0] ||
                  "Unknown"
                )
              : wallet,

          to:
            tx.direction === "SENT"
              ? (
                  tx.externalOutputs[0]
                    ?.address ||
                  "Unknown"
                )
              : wallet,

          amount:
            tx.direction === "SENT"
              ? Number(
                  (
                    tx.externalOutputValue /
                    100000000
                  ).toFixed(8)
                )
              : Number(
                  (
                    tx.walletReceived /
                    100000000
                  ).toFixed(8)
                ),

          timestamp:
            tx.timestamp,

          status:
            tx.status,
        })),

    fundFlow:
      buildFundFlow(
        bitcoinTransactions,
        wallet
      ),

    entities: [],

    riskBreakdown: [
      {
        factor:
          "Transaction Behavior",

        points:
          Math.min(
            30,
            riskScore
          ),

        description:
          "Transaction behavior was evaluated.",
      },

      {
        factor:
          "Fund Movement",

        points:
          Math.min(
            25,
            Math.max(
              0,
              riskScore - 5
            )
          ),

        description:
          "Movement of funds across blockchain addresses was analyzed.",
      },

      {
        factor:
          "Entity Association",

        points:
          Math.min(
            20,
            Math.max(
              0,
              riskScore - 10
            )
          ),

        description:
          "Potential blockchain entity associations were considered.",
      },

      {
        factor:
          "Transfer Value",

        points:
          Math.min(
            25,
            Math.max(
              0,
              riskScore - 15
            )
          ),

        description:
          "Observed transfer values were evaluated.",
      },
    ],
  };
}


// ============================================================
// ANALYZE WALLET
// ============================================================

app.post(
  "/api/analyze",
  async (req, res) => {

    try {

      console.log("------------------------------------------");
      console.log("New analysis request");

      const {
        wallet,
        blockchain,
        transaction,
      } = req.body;


      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      if (!wallet) {
        return res.status(400).json({
          success: false,
          error:
            "Wallet address is required.",
        });
      }


      if (!blockchain) {
        return res.status(400).json({
          success: false,
          error:
            "Blockchain is required.",
        });
      }


      console.log(
        "Wallet:",
        wallet
      );

      console.log(
        "Blockchain:",
        blockchain
      );

      console.log(
        "Transaction:",
        transaction ||
          "Not provided"
      );


      // ------------------------------------------------------
      // CURRENTLY SUPPORT BITCOIN
      // ------------------------------------------------------

      if (
        blockchain.toLowerCase() !==
        "bitcoin"
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Currently only Bitcoin analysis is supported.",
        });
      }


      // ------------------------------------------------------
      // FETCH ADDRESS DATA
      // ------------------------------------------------------

      console.log(
        "Fetching REAL Bitcoin data..."
      );

      const addressInfo =
        await getBitcoinAddressInfo(
          wallet
        );


      // ------------------------------------------------------
      // FETCH TRANSACTION HISTORY
      // ------------------------------------------------------

      const rawTransactions =
        await getBitcoinTransactions(
          wallet
        );


      // ------------------------------------------------------
      // PARSE TRANSACTIONS
      // ------------------------------------------------------

      const bitcoinTransactions =
        parseBitcoinTransactions(
          rawTransactions,
          wallet
        );


      // ------------------------------------------------------
      // TOTAL RECEIVED
      // ------------------------------------------------------

      const totalReceivedSats =
        bitcoinTransactions.reduce(
          (total, tx) =>
            total +
            (tx.walletReceived || 0),
          0
        );


      // ------------------------------------------------------
      // TOTAL ACTUAL EXTERNAL SENT
      // ------------------------------------------------------

      const totalSentSats =
        bitcoinTransactions.reduce(
          (total, tx) =>
            total +
            (tx.externalOutputValue || 0),
          0
        );


      // ------------------------------------------------------
      // TOTAL FEES
      // ------------------------------------------------------

      const totalFeesSats =
        bitcoinTransactions.reduce(
          (total, tx) =>
            total +
            (tx.fee || 0),
          0
        );


      // ------------------------------------------------------
      // BTC CONVERSION
      // ------------------------------------------------------

      const totalReceivedBTC =
        totalReceivedSats /
        100000000;

      const totalSentBTC =
        totalSentSats /
        100000000;

      const totalFeesBTC =
        totalFeesSats /
        100000000;


      const volumeBTC =
        totalReceivedBTC +
        totalSentBTC;


      // ------------------------------------------------------
      // TRANSACTION COUNTS
      // ------------------------------------------------------

      const confirmedTransactionCount =
        addressInfo.chain_stats
          ?.tx_count || 0;

      const mempoolTransactionCount =
        addressInfo.mempool_stats
          ?.tx_count || 0;

      const lifetimeTransactionCount =
        confirmedTransactionCount +
        mempoolTransactionCount;


      // ------------------------------------------------------
      // TRANSACTION DIRECTION COUNTS
      // ------------------------------------------------------

      const sentTransactionCount =
        bitcoinTransactions.filter(
          (tx) =>
            tx.direction === "SENT"
        ).length;

      const receivedTransactionCount =
        bitcoinTransactions.filter(
          (tx) =>
            tx.direction === "RECEIVED"
        ).length;


      // ------------------------------------------------------
      // GENERATE RISK ANALYSIS
      // ------------------------------------------------------

      const riskAnalysis =
        generateRiskAnalysis(
          wallet,
          blockchain,
          transaction,
          bitcoinTransactions
        );


      // ------------------------------------------------------
      // FINAL RESPONSE
      // ------------------------------------------------------

      const result = {

        wallet,

        blockchain,

        transaction:
          transaction ||
          "Not provided",


        // ----------------------------------------------
        // BALANCE
        // ----------------------------------------------

        balance:
          (
            addressInfo
              .chain_stats
              ?.funded_txo_sum -
            addressInfo
              .chain_stats
              ?.spent_txo_sum
          ) /
          100000000,


        balanceBTC:
          (
            (
              addressInfo
                .chain_stats
                ?.funded_txo_sum -
              addressInfo
                .chain_stats
                ?.spent_txo_sum
            ) /
            100000000
          ).toFixed(8),


        // ----------------------------------------------
        // TRANSACTION INFORMATION
        // ----------------------------------------------

        transactions:
          lifetimeTransactionCount,

        fetchedTransactions:
          bitcoinTransactions.length,

        sentTransactions:
          sentTransactionCount,

        receivedTransactions:
          receivedTransactionCount,


        // ----------------------------------------------
        // FUND INFORMATION
        // ----------------------------------------------

        totalReceived:
          totalReceivedBTC,

        totalSent:
          totalSentBTC,

        totalFees:
          totalFeesBTC,

        volumeBTC,


        // ----------------------------------------------
        // RAW SATOSHI VALUES
        // ----------------------------------------------

        totalReceivedSats,

        totalSentSats,

        totalFeesSats,


        // ----------------------------------------------
        // ADDRESS STATS
        // ----------------------------------------------

        addressStats:
          addressInfo.chain_stats,


        mempoolStats:
          addressInfo.mempool_stats,


        // ----------------------------------------------
        // TRANSACTION DATA
        // ----------------------------------------------

        transactionData:
          bitcoinTransactions,


        // ----------------------------------------------
        // RISK DATA
        // ----------------------------------------------

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

        fundFlow:
          riskAnalysis.fundFlow,

        entities:
          riskAnalysis.entities,

        riskBreakdown:
          riskAnalysis.riskBreakdown,
      };


      // ------------------------------------------------------
      // DEBUG OUTPUT
      // ------------------------------------------------------

      console.log(
        "------------------------------------------"
      );

      console.log(
        "Bitcoin analysis complete"
      );

      console.log(
        "Wallet balance:",
        result.balanceBTC,
        "BTC"
      );

      console.log(
        "Total received:",
        totalReceivedBTC,
        "BTC"
      );

      console.log(
        "Total sent:",
        totalSentBTC,
        "BTC"
      );

      console.log(
        "Total fees:",
        totalFeesBTC,
        "BTC"
      );

      console.log(
        "Transactions fetched:",
        bitcoinTransactions.length
      );

      console.log(
        "Lifetime transactions:",
        lifetimeTransactionCount
      );

      console.log(
        "------------------------------------------"
      );


      return res.json({
        success: true,
        data: result,
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
          "Failed to analyze wallet.",
      });
    }
  }
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  "/",
  (req, res) => {
    res.json({
      success: true,
      message:
        "TraceX backend is running",
      port: PORT,
    });
  }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
  PORT,
  () => {
    console.log(
      "------------------------------------------"
    );

    console.log(
      "TraceX backend running on port",
      PORT
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log(
      "------------------------------------------"
    );
  }
);