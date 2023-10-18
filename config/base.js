const WETH = "0x4200000000000000000000000000000000000006";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "base",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDCb 500
    wNativeStablePoolAddress: "0xe58b73ff901325b8b2056b29712c50237242f520",
    stableIsToken0: false,
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
    startBlock: 2912007,
    stableCoins: [
      "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDC.b
      "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
      "0x417ac0e078398c154edfadd9ef675d30be60af93", // crvUSD
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC native
    ],
    whitelistAddresses: [
      WETH,
      "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDC.b
      "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22", // cbETH
      "0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c", // rETH
      "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
      "0x417ac0e078398c154edfadd9ef675d30be60af93", // crvUSD
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC native
    ],
    nonfungiblePositionManagerAddress: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364",
    nonfungiblePositionManagerStartBlock: 2912503,
    minETHLocked: 1,
  },
  v2: {
    factoryAddress: "0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e",
    startBlock: 2910387,
    wNativeStablePair0: "0x0000000000000000000000000000000000000000", // WETH-USDCb
    wNativeStablePair1: "0x92363f9817f92a7ae0592a4cb29959a88d885cc8",
    whitelistAddresses: [
      WETH,
      "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDC
      "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22", // cbETH
      "0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c", // rETH
      "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
      "0x417ac0e078398c154edfadd9ef675d30be60af93", // crvUSD
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC native
    ],
    minETHLocked: 5,
  },
  masterChefV3: {
    masterChefAddress: "0xc6a2db661d5a5690172d8eb0a7dea2d3008665a3",
    startBlock: 2948222,
  },
};
