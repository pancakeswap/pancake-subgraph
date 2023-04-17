const WETH = "0x36696169c63e42cd08ce11f5deebbcebae652050";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "arbitrum-one",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "", // TODO: new chain
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
    minETHLocked: 4,
  },
  v2: {
    factoryAddress: "0x13eb8884bd7991f8dee804dad0436f7c806bf1b9",
    startBlock: 153223, // TODO: new chain
    wNativeStablePair0: "0x0000000000000000000000000000000000000000", // TODO: new chain
    wNativeStablePair1: "0x24c2a89b6a5aF4F7C6EFDdb92515837f4a5b632b", // WETH-USDC
    whitelistAddresses: [
      WETH,
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
    ],
  },
};
