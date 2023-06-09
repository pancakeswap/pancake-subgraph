const WETH = "0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "polygon-zkevm",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x4a080d9488ce2c8258185d78852275d6d3c2820c",
    stableIsToken0: true,
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
    startBlock: 750149,
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
    nonfungiblePositionManagerAddress: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364",
    nonfungiblePositionManagerStartBlock: 750354,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e",
    startBlock: 749593,
    wNativeStablePair0: "0x87414519f4121352657d755fc6ccce8e0b45596b", // WETH-USDT
    wNativeStablePair1: "0xcd9ea826c0090a8f7f36989171332bb007d3bd70", // WETH-USDC
    whitelistAddresses: [
      WETH,
      "0x1e4a5963abfd975d8c9021ce480b42188849d41d", // USDT
      "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035", // USDC
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // WMATIC
    ],
  },
};
