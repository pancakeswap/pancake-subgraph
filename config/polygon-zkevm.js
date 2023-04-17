const WETH = "0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "polygon-zkevm",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x36696169c63e42cd08ce11f5deebbcebae652050", // TODO: new chain
    stableIsToken0: true, // TODO: new chain
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865", // TODO: new chain
    startBlock: 26956207, // TODO: new chain
    stableCoins: [
      "0x1e4a5963abfd975d8c9021ce480b42188849d41d", // USDT
      "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0x1e4a5963abfd975d8c9021ce480b42188849d41d", // USDT
      "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035", // USDC
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // WMATIC
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
      "0x1e4a5963abfd975d8c9021ce480b42188849d41d", // USDT
      "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035", // USDC
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // WMATIC
    ],
  },
};
