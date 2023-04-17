const WETH = "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "zksync-era",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x36696169c63e42cd08ce11f5deebbcebae652050", // TODO: new chain
    stableIsToken0: true, // TODO: new chain
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865", // TODO: new chain
    startBlock: 26956207, // TODO: new chain
    stableCoins: [
      "0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181", // BUSD
      "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181", // BUSD
      "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4", // USDC
    ],
    nonfungiblePositionManagerAddress: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364", // TODO: new chain
    nonfungiblePositionManagerStartBlock: 26931961, // TODO: new chain
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "", // TODO: new chain
    startBlock: 0, // TODO: new chain
    wNativeStablePair0: "0x0000000000000000000000000000000000000000", // TODO: new chain
    wNativeStablePair1: "0x0000000000000000000000000000000000000000", // TODO: new chain
    whitelistAddresses: [
      WETH,
      "0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181", // BUSD
      "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4", // USDC
    ],
  },
};
