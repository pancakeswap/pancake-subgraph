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
      "0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4", // DAI
      "0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1", // WBTC
    ],
    whitelistAddresses: [
      WETH,
      "0x1e4a5963abfd975d8c9021ce480b42188849d41d", // USDT
      "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035", // USDC
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // WMATIC
      "0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4", // DAI
      "0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1", // WBTC
    ],
    nonfungiblePositionManagerAddress: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364",
    nonfungiblePositionManagerStartBlock: 750354,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e",
    startBlock: 749593,
    wNativeStablePair0: "0x03a9a6a8f62af9376a83c391fd90eeeea67fad6c", // WETH-USDT
    wNativeStablePair1: "0xcf6030b2bfb39bb51f70bf666581483b36ee0113", // WETH-USDC
    whitelistAddresses: [
      WETH,
      "0x1e4a5963abfd975d8c9021ce480b42188849d41d", // USDT
      "0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035", // USDC
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270", // WMATIC
      "0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4", // DAI
      "0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1", // WBTC
    ],
    minETHLocked: 0,
  },
  masterChefV3: {
    masterChefAddress: "0xe9c7f3196ab8c09f6616365e8873daeb207c0391",
    startBlock: 1731157,
  },
};
