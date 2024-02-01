const WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "arbitrum-one",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDC 500
    wNativeStablePoolAddress: "0xd9e2a1a61b6e61b275cec326465d417e52c1b95c",
    stableIsToken0: false,
    factoryAddress: "0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865",
    startBlock: 101028949,
    stableCoins: [
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // USDC
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC.e
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
    ],
    whitelistAddresses: [
      WETH,
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // USDC
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC.e
      "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
      "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", // WBTC
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
      "0xe80772eaf6e2e18b651f160bc9158b2a5cafca65", // USD+
      "0xb1084db8d3c05cebd5fa9335df95ee4b8a0edc30", // USDT+
    ],
    nonfungiblePositionManagerAddress: "0x46a15b0b27311cedf172ab29e4f4766fbe7f4364",
    nonfungiblePositionManagerStartBlock: 101032520,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e",
    startBlock: 101022992,
    wNativeStablePair0: "0x0000000000000000000000000000000000000000",
    wNativeStablePair1: "0xa59bd260f9707ea44551c510f714ccd482ec75d8", // WETH-USDC
    whitelistAddresses: [
      WETH,
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // USDC
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC.e
      "0x912ce59144191c1204e64559fe8253a0e49e6548", // ARB
      "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", // WBTC
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI
    ],
    minETHLocked: 0,
  },
  masterChefV3: {
    masterChefAddress: "0x5e09acf80c0296740ec5d6f643005a4ef8daa694",
    startBlock: 105053701,
  },
  predictionV2: {
    startBlock: 158927648,
    address: "0xF2F90E718a3BFaCb430c1818cB962f05A2631998",
  },
};
