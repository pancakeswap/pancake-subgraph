const WETH = "0x36696169c63e42cd08ce11f5deebbcebae652050";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "arbitrum-one",
  wNativeAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: WETH, // TODO: new chain
    stableIsToken0: true, // TODO: new chain
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865", // TODO: new chain
    startBlock: 26956207, // TODO: new chain
    stableCoins: [
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
    ],
    nonfungiblePositionManagerAddress: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364", // TODO: new chain
    nonfungiblePositionManagerStartBlock: 26931961, // TODO: new chain
  },
  v2: {
    factoryAddress: "", // TODO: new chain
    startBlock: 0, // TODO: new chain
    wNativeStablePair0: "0x0000000000000000000000000000000000000000", // TODO: new chain
    wNativeStablePair1: "0x0000000000000000000000000000000000000000", // TODO: new chain
    whitelistAddresses: [
      WETH,
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
    ],
  },
};
