const {
  createPublicClient,
  http,
  formatEther,
  isAddress,
} = require("viem");

const {
  base,
  baseSepolia,
} = require("viem/chains");


/* =========================================================
   EVM NETWORK CONFIG
========================================================= */

function getEVMConfig(network) {
  switch (network) {
    case "base":
      return {
        chain: base,
        chainId: 8453,
        rpcUrl: process.env.BASE_MAINNET_RPC_URL,
        blockscoutUrl:
          process.env.BLOCKSCOUT_BASE_MAINNET_URL ||
          "https://base.blockscout.com/api/v2",
        name: "Base Mainnet",
      };

    case "base-sepolia":
      return {
        chain: baseSepolia,
        chainId: 84532,
        rpcUrl: process.env.BASE_SEPOLIA_RPC_URL,
        blockscoutUrl:
          process.env.BLOCKSCOUT_BASE_SEPOLIA_URL ||
          "https://base-sepolia.blockscout.com/api/v2",
        name: "Base Sepolia",
      };

    default:
      throw new Error(
        `Unsupported EVM network: ${network}`
      );
  }
}


/* =========================================================
   EVM RPC CLIENT
========================================================= */

function getEVMClient(network) {
  const config = getEVMConfig(network);

  if (!config.rpcUrl) {
    throw new Error(
      `RPC URL missing for ${network}. Check your .env file.`
    );
  }

  return createPublicClient({
    chain: config.chain,
    transport: http(config.rpcUrl),
  });
}


/* =========================================================
   ADDRESS INFORMATION
========================================================= */

async function getEVMAddressInfo(address, network) {
  if (!isAddress(address)) {
    throw new Error("Invalid EVM address");
  }

  const config = getEVMConfig(network);
  const client = getEVMClient(network);

  console.log("------------------------------------------");
  console.log("Fetching EVM data");
  console.log(`Network: ${config.name}`);
  console.log(`Chain ID: ${config.chainId}`);
  console.log(`Address: ${address}`);
  console.log("------------------------------------------");

  const [
    balance,
    transactionCount,
    blockNumber,
  ] = await Promise.all([
    client.getBalance({
      address,
    }),

    client.getTransactionCount({
      address,
    }),

    client.getBlockNumber(),
  ]);

  return {
    address,
    blockchain: network,
    network: config.name,
    chainId: config.chainId,

    balanceWei: balance.toString(),
    balance: formatEther(balance),

    transactionCount,

    currentBlock: blockNumber.toString(),
  };
}


/* =========================================================
   HELPER: SAFE FETCH
========================================================= */

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}


/* =========================================================
   FETCH EVM TRANSACTIONS
========================================================= */

async function getEVMTransactions(
  address,
  network,
  maxTransactions = 500
) {
  if (!isAddress(address)) {
    throw new Error("Invalid EVM address");
  }

  const config = getEVMConfig(network);

  console.log("------------------------------------------");
  console.log("Fetching EVM transaction history");
  console.log(`Network: ${config.name}`);
  console.log(`Address: ${address}`);
  console.log(`Maximum transactions: ${maxTransactions}`);
  console.log("------------------------------------------");

  let allTransactions = [];

  let nextPageParams = null;

  let page = 1;

  while (
    allTransactions.length < maxTransactions
  ) {
    let url =
      `${config.blockscoutUrl}` +
      `/addresses/${address}/transactions`;

    /*
      Blockscout pagination is returned through
      next_page_params.

      We convert those parameters into a query string
      for the next request.
    */

    if (nextPageParams) {
      const query = new URLSearchParams(
        nextPageParams
      ).toString();

      url += `?${query}`;
    }

    console.log(
      `Fetching EVM transaction page ${page}...`
    );

    const data = await fetchJSON(url);

    const items = Array.isArray(data.items)
      ? data.items
      : [];

    console.log(
      `Page ${page}: ${items.length} transactions`
    );

    if (items.length === 0) {
      break;
    }

    allTransactions.push(...items);

    nextPageParams =
      data.next_page_params || null;

    if (!nextPageParams) {
      break;
    }

    page++;

    /*
      Safety limit so a huge wallet doesn't cause
      an accidental endless request loop.
    */

    if (page > 20) {
      console.log(
        "Pagination safety limit reached."
      );

      break;
    }
  }

  /*
    Limit final result.
  */

  allTransactions =
    allTransactions.slice(
      0,
      maxTransactions
    );

  /*
    Remove duplicate transaction hashes.
  */

  const uniqueTransactions = [];

  const seenHashes = new Set();

  for (const tx of allTransactions) {
    const hash = tx.hash;

    if (!hash) {
      continue;
    }

    if (seenHashes.has(hash)) {
      continue;
    }

    seenHashes.add(hash);

    uniqueTransactions.push(tx);
  }

  console.log(
    `Total unique EVM transactions: ${uniqueTransactions.length}`
  );

  return uniqueTransactions;
}


/* =========================================================
   FETCH ERC-20 TOKEN TRANSFERS
========================================================= */

async function getEVMTokenTransfers(
  address,
  network,
  maxTransfers = 500
) {
  if (!isAddress(address)) {
    throw new Error("Invalid EVM address");
  }

  const config = getEVMConfig(network);

  console.log("------------------------------------------");
  console.log("Fetching EVM token transfers");
  console.log(`Network: ${config.name}`);
  console.log(`Address: ${address}`);
  console.log(`Maximum transfers: ${maxTransfers}`);
  console.log("------------------------------------------");

  let allTransfers = [];

  let nextPageParams = null;

  let page = 1;

  while (
    allTransfers.length < maxTransfers
  ) {
    let url =
      `${config.blockscoutUrl}` +
      `/addresses/${address}/token-transfers`;

    if (nextPageParams) {
      const query = new URLSearchParams(
        nextPageParams
      ).toString();

      url += `?${query}`;
    }

    console.log(
      `Fetching token-transfer page ${page}...`
    );

    const data = await fetchJSON(url);

    const items = Array.isArray(data.items)
      ? data.items
      : [];

    console.log(
      `Token page ${page}: ${items.length} transfers`
    );

    if (items.length === 0) {
      break;
    }

    allTransfers.push(...items);

    nextPageParams =
      data.next_page_params || null;

    if (!nextPageParams) {
      break;
    }

    page++;

    if (page > 20) {
      console.log(
        "Token pagination safety limit reached."
      );

      break;
    }
  }

  allTransfers =
    allTransfers.slice(
      0,
      maxTransfers
    );

  console.log(
    `Total token transfers: ${allTransfers.length}`
  );

  return allTransfers;
}


/* =========================================================
   NORMALIZE DIRECTION
========================================================= */

function getDirection(
  wallet,
  from,
  to
) {
  const walletLower =
    wallet.toLowerCase();

  const fromLower =
    from?.toLowerCase();

  const toLower =
    to?.toLowerCase();

  if (
    fromLower === walletLower &&
    toLower === walletLower
  ) {
    return "SELF";
  }

  if (fromLower === walletLower) {
    return "SENT";
  }

  if (toLower === walletLower) {
    return "RECEIVED";
  }

  return "UNKNOWN";
}


/* =========================================================
   NORMALIZE NATIVE EVM TRANSACTIONS
========================================================= */

function normalizeEVMTransactions(
  transactions,
  wallet,
  network
) {
  const normalized = [];

  for (const tx of transactions) {
    const from =
      tx.from?.hash ||
      tx.from?.address ||
      tx.from ||
      null;

    const to =
      tx.to?.hash ||
      tx.to?.address ||
      tx.to ||
      null;

    if (!from) {
      continue;
    }

    const valueWei =
      tx.value || "0";

    const direction =
      getDirection(
        wallet,
        from,
        to
      );

    const timestamp = tx.timestamp
      ? Math.floor(
          new Date(
            tx.timestamp
          ).getTime() / 1000
        )
      : null;

    let feeWei = "0";

    if (
      tx.gas_used != null &&
      tx.gas_price != null
    ) {
      try {
        feeWei = (
          BigInt(tx.gas_used) *
          BigInt(tx.gas_price)
        ).toString();
      } catch {
        feeWei = "0";
      }
    }

    let value = "0";

    try {
      value =
        formatEther(
          BigInt(valueWei)
        );
    } catch {
      value = "0";
    }

    let fee = "0";

    try {
      fee =
        formatEther(
          BigInt(feeWei)
        );
    } catch {
      fee = "0";
    }

    normalized.push({
      txid:
        tx.hash ||
        tx.transaction_hash ||
        null,

      blockchain: network,

      direction,

      from,

      to,

      valueWei,

      value,

      asset: "ETH",

      timestamp,

      blockNumber:
        tx.block ||
        tx.block_number ||
        null,

      feeWei,

      fee,

      status:
        tx.status ||
        tx.result ||
        "unknown",

      method:
        tx.method ||
        tx.decoded_input?.method_call ||
        null,

      type: "native",
    });
  }

  return normalized;
}


/* =========================================================
   NORMALIZE ERC-20 TOKEN TRANSFERS
========================================================= */

function normalizeEVMTokenTransfers(
  transfers,
  wallet,
  network
) {
  const normalized = [];

  for (const transfer of transfers) {
    const from =
      transfer.from?.hash ||
      transfer.from?.address ||
      transfer.from ||
      null;

    const to =
      transfer.to?.hash ||
      transfer.to?.address ||
      transfer.to ||
      null;

    if (!from && !to) {
      continue;
    }

    const direction =
      getDirection(
        wallet,
        from,
        to
      );

    const token =
      transfer.token || {};

    const tokenAddress =
      token.address ||
      token.hash ||
      null;

    const symbol =
      token.symbol ||
      "UNKNOWN";

    const decimals =
      Number.isInteger(
        Number(token.decimals)
      )
        ? Number(token.decimals)
        : 18;

    const rawValue =
      transfer.total?.value ||
      transfer.value ||
      "0";

    let formattedValue = "0";

    try {
      const raw =
        BigInt(rawValue);

      if (decimals === 0) {
        formattedValue =
          raw.toString();
      } else {
        const divisor =
          10n ** BigInt(decimals);

        const whole =
          raw / divisor;

        const fraction =
          raw % divisor;

        formattedValue =
          `${whole}.${fraction
            .toString()
            .padStart(
              decimals,
              "0"
            )
            .replace(/0+$/, "")}`;

        if (
          formattedValue.endsWith(".")
        ) {
          formattedValue =
            formattedValue.slice(
              0,
              -1
            );
        }
      }
    } catch {
      formattedValue = "0";
    }

    const timestamp =
      transfer.timestamp
        ? Math.floor(
            new Date(
              transfer.timestamp
            ).getTime() / 1000
          )
        : null;

    normalized.push({
      txid:
        transfer.transaction_hash ||
        transfer.tx_hash ||
        transfer.transaction?.hash ||
        null,

      blockchain: network,

      direction,

      from,

      to,

      valueWei: rawValue,

      value: formattedValue,

      asset: symbol,

      tokenAddress,

      decimals,

      timestamp,

      blockNumber:
        transfer.block_number ||
        transfer.block ||
        null,

      feeWei: "0",

      fee: "0",

      status: "ok",

      method: null,

      type: "erc20",
    });
  }

  return normalized;
}


/* =========================================================
   COMBINED EVM ANALYSIS DATA
========================================================= */

async function getEVMAnalysisData(
  address,
  network
) {
  const [
    addressInfo,
    rawTransactions,
    rawTokenTransfers,
  ] = await Promise.all([
    getEVMAddressInfo(
      address,
      network
    ),

    getEVMTransactions(
      address,
      network,
      500
    ),

    getEVMTokenTransfers(
      address,
      network,
      500
    ),
  ]);

  const nativeTransactions =
    normalizeEVMTransactions(
      rawTransactions,
      address,
      network
    );

  const tokenTransactions =
    normalizeEVMTokenTransfers(
      rawTokenTransfers,
      address,
      network
    );

  /*
    Native transactions and token transfers can
    refer to the same transaction hash.

    We keep both because they represent different
    asset movements.
  */

  const transactions = [
    ...nativeTransactions,
    ...tokenTransactions,
  ];

  /*
    Sort newest first.
  */

  transactions.sort(
    (a, b) => {
      return (
        (b.timestamp || 0) -
        (a.timestamp || 0)
      );
    }
  );

  return {
    addressInfo,

    transactions,

    nativeTransactions,

    tokenTransactions,

    rawTransactionCount:
      rawTransactions.length,

    rawTokenTransferCount:
      rawTokenTransfers.length,

    normalizedTransactionCount:
      transactions.length,
  };
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  getEVMConfig,
  getEVMClient,
  getEVMAddressInfo,
  getEVMTransactions,
  getEVMTokenTransfers,
  normalizeEVMTransactions,
  normalizeEVMTokenTransfers,
  getEVMAnalysisData,
};