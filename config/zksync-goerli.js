const WETH = "0x20b28b1e4665fff290650586ad76e977eab90c5d";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "zkSync2-testnet",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x25f728a155C883aa9bFfa8474b3e5Cd82B89e055", // TODO: new chain
    stableIsToken0: true, // TODO: new chain
    factoryAddress: "0x57d01fbde077c04381a28840a24acbeef8314062", // TODO: new chain
    startBlock: 5266264, // TODO: new chain
    stableCoins: [
      "0x0faf6df7054946141266420b43783387a78d82a9", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0x0faf6df7054946141266420b43783387a78d82a9", // USDC
    ],
    nonfungiblePositionManagerAddress: "0x1ede0ff9b7bd6dc0625e3ba579d5fd697e6698b2", // TODO: new chain
    nonfungiblePositionManagerStartBlock: 5269483, // TODO: new chain
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0xa4370037e4c151449fb7166dccb9fcf30b812baf",
    startBlock: 5135461,
    wNativeStablePair0: "0x06c4c41108d79b131d2d8456ede66556ebf23aea", // TODO: new chain
    wNativeStablePair1: "0x0000000000000000000000000000000000000000", // TODO: new chain
    whitelistAddresses: [
      WETH,
      "0x0faf6df7054946141266420b43783387a78d82a9", // USDC
    ],
  },
};
